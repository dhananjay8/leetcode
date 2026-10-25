# Linux & Networking Fundamentals — Interview Notes

## 1. Linux — File System & Navigation

```bash
ls -la                  # list all files with permissions
cd /var/log             # change directory
pwd                     # print working directory
find / -name "*.log"    # find files by name
locate nginx.conf       # fast file search (uses index)
du -sh /var/*           # disk usage per directory
df -h                   # filesystem disk space usage
tree -L 2               # directory tree (2 levels)
```

### File Operations

```bash
cat file.txt            # view file
less file.txt           # paginated view
head -n 20 file.txt     # first 20 lines
tail -f /var/log/syslog # follow log in real-time (CRITICAL for debugging)
grep -rn "error" /var/log/  # recursive search with line numbers
grep -i "pattern" file  # case-insensitive search
awk '{print $1, $3}' file   # extract columns
sed 's/old/new/g' file  # find & replace
wc -l file.txt          # count lines
```

### Users & Permissions

```bash
chmod 755 script.sh     # rwxr-xr-x (owner:rwx, group:rx, others:rx)
chmod +x script.sh      # make executable
chown user:group file   # change ownership
sudo useradd devops     # create user
sudo usermod -aG docker devops  # add user to docker group

# Permission bits: r=4, w=2, x=1
# 755 = rwxr-xr-x (scripts)  644 = rw-r--r-- (configs)  600 = rw------- (secrets, SSH keys)
```

### Process Management

```bash
ps aux | grep nginx     # find process
top / htop              # real-time resource monitor
kill -15 <PID>          # SIGTERM — graceful (lets app cleanup)
kill -9 <PID>           # SIGKILL — immediate, no cleanup, can't be caught
systemctl status|restart|enable nginx
journalctl -u nginx -f  # follow service logs (systemd)
nohup ./script.sh &     # survives logout
```

### Disk & Memory

```bash
free -h                 # RAM + swap
vmstat 1                # VM stats every 1s
iostat                  # I/O statistics
lsblk                   # block devices
mount /dev/sdb1 /mnt    # mount disk
df -i                   # inode usage (disk "full" at 40% space = 100% inodes!)
lsof +L1                # unlinked (deleted) files still held open by a process
```

### Linux Kernel & Process Internals (Staff Interview Favorites)

| Process State (`ps STAT`) | Meaning | Operational nuance |
| --- | --- | --- |
| `R` | Running or runnable (on run queue) | Normal active execution |
| `S` | Interruptible sleep | Waiting for event/socket; wakes on signal |
| `D` | **Uninterruptible sleep** (disk/NFS I/O) | **`kill -9` cannot kill it** — process only wakes when syscall returns (fix disk/NFS mount or reboot) |
| `Z` | **Zombie** (defunct) | Process exited, parent hasn't called `wait()`; uses zero RAM/CPU, holds a PID slot. Kill/restart the **parent** (`PPID`) to reap |
| `T` | Stopped | Paused via `SIGSTOP` or debugger (`Ctrl+Z`) |

- **Zombie vs Orphan**:
  - **Zombie**: dead process still in process table waiting for parent `waitpid()`.
  - **Orphan**: alive process whose parent died; re-parented to **PID 1** (`systemd` or container init), which reaps it upon exit.
- **Load Average Trap**: On Linux (unlike BSD), load average counts **`R` (runnable) + `D` (uninterruptible I/O)**. Load average of `32` on an 8-core box with `5%` CPU usage means 32 threads are stuck in `D` state waiting on disk/NFS I/O.
- **Classic "No space left on device" when `df -h` has free space**:
  1. **Deleted file held open**: `rm /var/log/huge.log` removes the directory link, not the blocks, if `nginx` still has the FD open. Check `lsof +L1`; fix by `truncate -s 0 /proc/<pid>/fd/<n>` or restarting/reloading the process.
  2. **Inode exhaustion**: millions of tiny session/cache files consume 100% of inodes (`df -i`).
  3. **Reserved root blocks**: ext4 reserves 5% for `root` by default (`tune2fs -m`).
- **Kernel Limits (`sysctl` / `ulimit`) that break high-scale servers**:
  - `ulimit -n` / `fs.file-max`: max open file descriptors (every socket is an FD; default `1024` per process is too low for proxies/DBs → raise to `65535+`).
  - `net.core.somaxconn` & `net.ipv4.tcp_max_syn_backlog`: TCP listen/SYN queue depth (drops connections under burst if too small).
  - `net.netfilter.nf_conntrack_max`: kernel connection-tracking table limit; when full, drops packets with `nf_conntrack: table full, dropping packet` in `dmesg`.

---

## 2. Cloud VM Disk Attach & Mount Pipeline (AWS & Azure — Linux & Windows)

Generalized agentless snapshot-scanning architecture (`flexscan-service` orchestrator + `flexscan-utility` on-VM scan-server): point-in-time snapshots of target VM disks (OS + data) are materialized as disks, attached to an isolated scanner VM, mounted **strictly read-only**, reconstructed into a single guest root tree, and scanned in one pass (`qscanner vmsnapshot /mnt/<vm_id>` with `--multi-volume=true --multi-partition=true`).

### End-to-End Orchestration & Disk Attach Sequence

```text
1. Snapshot Creation      Target VM disks (OS + data) → point-in-time cloud snapshots
2. LUN / Serial Mapping   Orchestrator assigns stable IDs per disk:
                            - Azure: integer LUN >= 1 (LUN 0 reserved for scanner OS disk)
                              + diskName = qualys-boot-disk-<event8>-<lun:02d>
                            - AWS:   EBS Volume ID → exposed inside guest NVMe/Xen serial (vol-xxxx → volxxxx)
3. Disk Attach to Scanner
                            - AWS:   Orchestrator creates EBS volumes from snapshots & attaches to scanner EC2
                            - Azure: Either attached at VM launch (storageProfile.dataDisks) OR hot-attached
                                     at /scan time via IMDS token → ARM PUT Disk (createOption=Copy) →
                                     ARM PATCH VM dataDisks (caching=ReadOnly, deleteOption=Delete, serialized by lock)
4. OS Bus Rescan          Force guest kernel to enumerate newly attached block devices
5. Disk → VM Matching     Filter out scanner's own OS/temp disks; match data disks to target VMs by Serial (AWS) or HCTL LUN (Azure)
6. Partition & LVM Open   Classify fstypes; import/rename duplicate LVM Volume Groups; activate Logical Volumes
7. Hardened Mount + Tree  Mount read-only (ro,nodev,nosuid,noexec) + reconstruct split /var, /usr, Btrfs subvols, OSTree
```

### AWS vs Azure Disk Identification & Attach Comparison

| Dimension | **AWS (EC2 + EBS)** | **Azure (VM + Managed Disks)** |
| --- | --- | --- |
| **Hardware bus** | Nitro **NVMe** (`/dev/nvme1n1`) or Xen (`/dev/xvdf`) | Hyper-V **SCSI** (`/dev/sdc`, `/dev/sdd`) |
| **How disk maps to target VM** | **Disk Serial Number** (`lsblk -o SERIAL` / Windows `AdapterSerialNumber` contains `vol-<id>` without hyphen) | **SCSI LUN** (`lsblk -o HCTL` `host:channel:target:lun` 4th field on Linux; `Path` hex `&0&<6-hex-LUN>#` / `Location` / `Number == LUN` on Windows) |
| **Excluding scanner's own disks** | Only disks whose serial matches the target `serial_numbers[]` list are touched | Resolve scanner `/` disk (`lsblk`/`/proc/mounts`) and Azure temp disk (`/dev/disk/azure/resource` symlink) by **identity**, not controller number (Hyper-V can swap controller 0/1 at boot!) |
| **Auto-cleanup on VM delete** | `DeleteOnTermination: true` on EBS block device mapping | `deleteOption: "Delete"` on OS disk, NIC, and every `dataDisks[]` entry → ARM cascade-deletes on VM delete |

---

### Linux Step-by-Step Mounting Process (`linux_mount.py`)

```text
Step 1: Bus Rescan & Wait for Expected Disks
  └─ Write "- - -" to /sys/class/scsi_host/host*/scan; poll lsblk -J until all expected LUNs appear

Step 2: Exclude Scanner System Disks & Match Target Disks
  ├─ Exclude disk backing "/" (lsblk / /proc/mounts) + "/dev/disk/azure/resource" (ephemeral disk)
  ├─ Match remaining disks via Serial (AWS) or HCTL[3] == lun (Azure)
  └─ Build mount prefix: /mnt/<vm_id>/<disk_label> (where disk_label = diskName or vol_id)

Step 3: Classify Filesystems (lsblk -J -o NAME,TYPE,FSTYPE)
  ├─ Whole-disk filesystem (no partition table) → mount /dev/sdX directly
  ├─ Partitioned disk → inspect each child partition:
  │   ├─ LVM2_member        → descend into LVM handler (Step 4)
  │   ├─ Mountable FS       → ext2/3/4, xfs, btrfs, vfat, ntfs, exfat, squashfs, iso9660
  │   ├─ crypto_LUKS        → log warning & skip (encrypted, no passphrase)
  │   ├─ Unsupported RAID   → linux_raid_member, zfs_member, stratis, vdo → log & skip
  │   └─ swap / empty       → skip (BIOS grub / MSR / swap partitions)

Step 4: LVM Volume Group De-Conflict & Activation (Critical when mounting multiple snapshots!)
  ├─ Problem: 2 snapshots from the same golden image have identical VG names ("rootvg") & VG UUIDs!
  ├─ RHEL 9+ (lvm2 >= 2.03.13): register device first via `lvmdevices --adddev /dev/<part>`
  │   (otherwise LVM rejects newly attached disks with "device is not in devices file")
  ├─ Run `vgimportclone -n <disk>vg /dev/<part>` (generates new VG/PV UUIDs + renames VG to <disk>vg)
  │   ├─ If "active LVs" error → `vgchange -an --select vg_uuid=<uuid>` then retry `vgimportclone`
  │   └─ If exit code 5 (already exists) or 124 (30s lock timeout, child killed) → fallback `vgrename <vg_uuid> <disk>vg`
  ├─ Activate LVs: `vgchange -ay <disk>vg` → exposes `/dev/mapper/<vg>-<lv>`
  └─ Nest LVs by normalized name: mount `rootlv` first at `<prefix>/rootlv`, then nest `varlv` → `<rootlv>/var`,
     `varloglv` → `<rootlv>/var/log`, `homelv` → `<rootlv>/home`, `usrlv` → `<rootlv>/usr` (longest-path match first)

Step 5: Hardened Per-Filesystem Mount + Auto-Repair Retry (max 3 retries)
  ├─ Sort mounts by depth so parent (`/`) always mounts before child (`/var`, `/var/log`)
  ├─ Mandatory security flags on EVERY mount: `-o ro,nodev,nosuid,noexec`
  │   (prevents snapshot mutation, device-node abuse, setuid escalation, or binary execution)
  ├─ Per-FS options & recovery:
  │   ├─ ext2/3/4 : `-o ro,nodev,nosuid,noexec,noatime`
  │   ├─ xfs      : `-o ro,nodev,nosuid,noexec,nouuid,noatime` (`nouuid` MANDATORY for duplicate snapshot UUIDs;
  │   │             if mount fails with "Structure needs cleaning" → run `xfs_repair /dev/<part>` and retry)
  │   ├─ btrfs    : try default mount; if top-level subvol lacks `/etc` (Fedora `root/etc`), remount `-o subvol=root`
  │   │             or fallback chain (`subvol=@`, `nospace_cache`, `recovery`); then run `btrfs subvolume list`
  │   │             and mount sibling subvolumes (`@home` → `/home`, `@/var` → `/var`) inside the root mount
  │   ├─ ntfs     : try in-kernel `ntfs3` (`modprobe ntfs3`) first, fallback to FUSE `ntfs-3g`
  │   └─ OSTree   : if `ostree/deploy/<os>/deploy/<hash>.0/etc` exists (Fedora/RHEL CoreOS), `mount --bind` to `<mnt>-ostree-root`

Step 6: Multi-Disk Guest Root Assembly (`assemble_guest_root` via `/etc/fstab`)
  ├─ Why: qscanner requires `/etc/os-release` and `/var/lib/rpm` (or `/var/lib/dpkg/status`) under the SAME root directory;
  │       if `/var` lives on a separate data disk, mounting it as a sibling causes "OS packages detected: 0"
  ├─ Identify guest root volume via OS marker files (`etc/os-release`, `etc/redhat-release`, `etc/debian_version`)
  ├─ Parse guest `<root>/etc/fstab` (matching by `UUID=`, `LABEL=`, `PARTUUID=`, or `/dev/`, since LVM names changed)
  └─ Bind-mount (`mount --bind -o ro`) secondary volumes into `<root_mnt>/var`, `<root_mnt>/usr`, etc. in depth order
```

---

### Windows Step-by-Step Mounting Process (`windows_mount.py`)

```text
Step 1: Force Windows Storage Bus Rescan
  └─ Run `Update-HostStorageCache` via PowerShell (without this, hot-attached Azure disks don't appear in Get-Disk)

Step 2: Enumerate Disks & Match to Target VM (Serialized under `_MOUNT_LOCK` / `_win_mount_lock`)
  ├─ Query `Get-Disk | Select-Object Number,Path,UniqueId,SerialNumber,OperationalStatus,Location,FriendlyName`
  │   (for Windows Storage Spaces / SQL Server virtual disks where Location is null, join `Get-VirtualDisk -> Get-PhysicalDisk` to read `PhysicalLocation`)
  └─ Match disk to target VM (in priority order):
      1. AWS: `AdapterSerialNumber == serial_number`
      2. Azure LUN from `Location` regex (`LUN N`, `L01)`) OR from `Path` SCSI hex address (`&0&([0-9a-fA-F]{6})#`
         — immune to PowerShell `ConvertTo-Json` 80-char string truncation!)
      3. Fallback: `SerialNumber` match → `disk.Number == target_lun` (Azure Windows assigns Disk Number = LUN)

Step 3: Bring Disk Online & Set Read-Only
  ├─ Newly attached cloud disks default to `Offline` on Windows to prevent signature collisions
  └─ Run `Set-Disk -Number <N> -IsOffline $false` followed by `Set-Disk -Number <N> -IsReadOnly $true`

Step 4: Filter Usable Partitions & Assign Drive Letters (D: through Z:)
  ├─ Query `Get-Partition -DiskNumber <N>` joined with `Get-Volume`
  ├─ Skip non-data partition types: `Recovery`, `System`, `Reserved`, `EFI System`, `Microsoft Reserved`
  ├─ Keep only supported filesystems: `NTFS`, `ReFS`, `FAT32`, `exFAT`, `FAT` (or `Basic` / `IFS` / `XINT13`)
  └─ If partition has no `DriveLetter`:
      - Assign next free letter (`D`–`Z`, reserving `A,B,C` and tracking active letters in `_RESERVED_DRIVE_LETTERS`)
      - Execute `Add-PartitionAccessPath -DiskNumber <N> -PartitionNumber <P> -AccessPath '<Letter>:\'` (or `-AssignDriveLetter`)

Step 5: Identify Definitive Windows OS Volume & Run Pre-Scan Registry/System Collector
  ├─ Probe mounted drives for definitive OS markers:
  │   `Windows\System32\config\SYSTEM` (registry hive) and `Windows\System32\ntoskrnl.exe`
  │   (NEVER use `bootmgr` or `Boot\BCD` — those live on the 500MB System Reserved/EFI boot partition and cause false positives!)
  └─ Execute `Pre_Scan.ps1 -ArgumentList "D,E,..."` → outputs `--shell-commands` passed to `qscanner.exe winvmsnapshot`
```

### Top Production Gotchas From Cloud Disk Mounting (Great Interview Stories)

1. **Duplicate XFS UUID & LVM VG Collisions**: Attaching two snapshots cloned from the same golden AMI/image onto one scanner VM fails immediately on standard Linux: XFS refuses to mount duplicate filesystem UUIDs (fix: `-o nouuid`), and LVM refuses duplicate VG names/UUIDs (fix: `lvmdevices --adddev` + `vgimportclone -n <disk>vg` + `vgrename <vg_uuid>`).
2. **Split `/var` Zero-Package Bug**: CIS-hardened RHEL/Ubuntu VMs place `/var` and `/usr` on separate LVs or disks. If mounted as siblings (`/mnt/vm1/root` and `/mnt/vm1/var`), the scanner reads `/etc/os-release` from `root` but sees an empty `/var/lib/rpm`, reporting **0 installed packages / 0 vulnerabilities**. Fix: reconstruct the guest tree by nesting LVs and parsing the guest's own `/etc/fstab` by `UUID`/`LABEL` to `mount --bind` `/var` inside `<root>/var`.
3. **Azure Hyper-V Controller Swap on Boot**: When snapshot data disks are attached in `storageProfile.dataDisks` at VM creation time, Azure Hyper-V can enumerate a data disk on SCSI Controller 0 (`0:0:0:0`) and push the scanner's own OS disk to Controller 1 (`1:0:0:1`). Filtering by `host_id == 0` alone caused the scanner to skip the target disk or scan itself — fixed by resolving `/` (`lsblk`/`/proc/mounts`) and `/dev/disk/azure/resource` by **device identity**.
4. **Windows `ConvertTo-Json` Truncation & System Reserved False-Positive**: PowerShell truncates long `Location` strings, hiding the `LUN N` suffix → solved by parsing the 6-digit hex LUN from the `\\?\scsi#...&0&000002#` device `Path`. And checking `Windows\System32\ntoskrnl.exe` instead of `bootmgr` prevents mistaking the 500MB System Reserved partition for `C:\`.

---

## 3. Networking — OSI & Protocols

### OSI Model (bottom → top)

```text
1. Physical      — cables, signals, NIC hardware
2. Data Link     — MAC addresses, switches, ARP
3. Network       — IP addressing, routing
4. Transport     — TCP (reliable) / UDP (fast)
5. Session       — session management, auth dialogs
6. Presentation  — TLS/encryption, compression, encoding
7. Application   — HTTP, DNS, SSH, FTP
```

Mnemonic (7→1): "All People Seem To Need Data Processing."

### TCP vs UDP

| Feature | TCP | UDP |
| --------- | ----- | ----- |
| Connection | Oriented (3-way handshake) | Connectionless |
| Reliability | Ordered, retransmitted, guaranteed | Best-effort |
| Overhead | Higher | Lower → faster |
| Use cases | HTTP(S), SSH, DB, gRPC | DNS (53/udp), QUIC basis, VoIP, gaming |

### TCP 3-Way Handshake

```text
Client → SYN       → Server
Client ← SYN-ACK   ← Server
Client → ACK       → Server  → connection established
```

Connection teardown uses FIN/ACK in both directions; `TIME_WAIT` lingers ~2×MSL — high-churn servers hit ephemeral-port exhaustion (~28k default range; tune `ip_local_port_range`, `tw_reuse` carefully).

### DNS Resolution Sequence

1. Browser/OS cache → `/etc/hosts`
2. Recursive resolver (ISP or 8.8.8.8)
3. Root NS → TLD NS (.com) → Authoritative NS (example.com)
4. A/AAAA record returned with TTL → cached → TCP/TLS connect

### TLS Handshake (simplified)

1. ClientHello (versions, cipher suites, SNI)
2. ServerHello + certificate (public key, CA chain)
3. Client verifies chain → generates session key, encrypts with server pubkey
4. Symmetric AES session begins (TLS 1.3 does this in fewer round trips — 1-RTT)

- **TLS vs mTLS (Mutual TLS)**: Standard TLS authenticates only the **server** to the client. **mTLS** adds step 3b: server sends `CertificateRequest`, client presents its own X.509 cert (e.g., SPIFFE ID from Istio/Vault PKI), and both sides verify against a trusted internal CA. Mandatory for zero-trust east-west microservice traffic.

### HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC)

| Protocol | Transport | Multiplexing | Head-of-Line (HoL) Blocking | Key Interview Nuance |
| --- | --- | --- | --- | --- |
| **HTTP/1.1** | TCP | No (1 req/conn at a time; browsers open 6 TCP conns) | L7 HoL blocking | Text headers, high connection churn |
| **HTTP/2** | TCP | Yes (many streams over **1 TCP connection**, HPACK header compression) | Solved at L7, **still has L4 TCP HoL** (1 lost TCP packet stalls all streams) | **gRPC uses HTTP/2** — L4 load balancers pin all streams of 1 client to 1 backend pod! Needs L7 LB (Envoy/ALB) or client-side LB |
| **HTTP/3** | **UDP (QUIC)** | Yes (independent streams in QUIC) | **Zero HoL blocking** (lost packet only stalls that single stream) | Built-in TLS 1.3 (0-RTT/1-RTT), connection migration across IP/Wi-Fi changes |

---

## 4. Networking Commands

```bash
ping host                   # reachability (ICMP — often firewalled; not proof of outage)
traceroute host             # path/hops
nslookup / dig example.com  # DNS queries (dig +trace walks the chain)
curl -v https://api.com     # full TLS+HTTP trace; -o for body only
ss -tlnp                    # listening TCP sockets + PIDs (netstat successor)
ip addr show                # interfaces/addresses
iptables -L -n              # firewall rules
nc -zv host 443             # TCP port open check (better than ping)
```

### HTTP Status Codes

| Code | Meaning | Interview note |
| ------ | --------- | ---------------- |
| 200 | OK | — |
| 201 | Created | POST success |
| 301/302 | Permanent / temporary redirect | 301 is cached hard — dangerous |
| 400 | Bad Request | Client payload invalid |
| 401 | Unauthorized | No/invalid **authn** |
| 403 | Forbidden | Authenticated, no **authz** |
| 404 | Not Found | — |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Server Error | App bug |
| 502 | Bad Gateway | LB→upstream connect/read failed |
| 503 | Service Unavailable | Overloaded or unhealthy targets |
| 504 | Gateway Timeout | Upstream too slow — check downstream latency first |

**502 vs 503 vs 504** (common follow-up): 502 = upstream *responded badly* (reset/refused/invalid); 503 = no capacity/unhealthy; 504 = upstream too slow to answer.

---

## 5. Interview Q&A

**Q: What happens when you type google.com?**
DNS → TCP handshake → TLS handshake → HTTP GET → server processes → response → browser parses HTML → fetches CSS/JS/images (each may repeat the chain; HTTP/2 multiplexes on one connection).

**Q: `kill -9` vs `kill -15`?**
`-15` SIGTERM: catchable, graceful shutdown hooks run (K8s sends this first). `-9` SIGKILL: kernel force-kill, uncatchable — last resort; leaves sockets/locks dirty.

**Q: Slow server — first commands?**
`top/htop` (CPU/mem) → `df -h` (disk full) → `free -h` (swap thrash) → `ss -tlnp`/netstat (conn storms) → `iostat`/`vmstat` (I/O wait) → `journalctl -f` + app logs.

**Q: Forward vs reverse proxy?**
Forward: client-side, hides clients (corp egress proxy). Reverse: server-side, hides backends (Nginx, ALB) — does TLS termination, routing, caching, WAF.

---

## 6. Recall — Sound Bites

- "SIGTERM politely, SIGKILL finally — K8s sends 15, waits `terminationGracePeriodSeconds` (default 30s), then 9."
- "502 bad response · 503 no capacity · 504 too slow."
- "Stateful SG, stateless NACL" (see `../AWS` notes).
- "TCP pays for order; UDP pays nothing."
- Debugging order: **is it CPU, memory, disk, network, or the app?** — top → df → free → ss → logs.
