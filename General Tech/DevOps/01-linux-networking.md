# Linux & Networking Fundamentals

## Linux — Essential Commands for DevOps

### File System & Navigation
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
# 755 = rwxr-xr-x (common for scripts)
# 644 = rw-r--r-- (common for config files)
# 600 = rw------- (secrets, SSH keys)
```

### Process Management
```bash
ps aux                  # all running processes
ps aux | grep nginx     # find specific process
top / htop              # real-time resource monitor
kill -9 <PID>           # force kill process
kill -15 <PID>          # graceful termination (SIGTERM)
systemctl status nginx  # check service status
systemctl restart nginx # restart service
systemctl enable nginx  # start on boot
journalctl -u nginx -f  # follow service logs (systemd)
nohup ./script.sh &     # run in background, persist after logout
```

### Disk & Memory
```bash
free -h                 # memory usage (RAM + swap)
vmstat 1                # virtual memory stats every 1s
iostat                  # I/O statistics
lsblk                  # list block devices (disks)
mount /dev/sdb1 /mnt   # mount a disk
```

---

## Networking — Interview Essentials

### OSI Model (7 Layers)
```
7. Application   — HTTP, HTTPS, DNS, SSH, FTP
6. Presentation  — SSL/TLS, encryption, compression
5. Session       — Session management, authentication
4. Transport     — TCP (reliable), UDP (fast)
3. Network       — IP addressing, routing
2. Data Link     — MAC addresses, switches, ARP
1. Physical      — Cables, signals, hardware
```

**Interview shortcut**: "Please Do Not Throw Sausage Pizza Away" (Physical → Application)

### TCP vs UDP
| Feature | TCP | UDP |
|---------|-----|-----|
| Connection | Connection-oriented (3-way handshake) | Connectionless |
| Reliability | Guaranteed delivery, ordering | No guarantees |
| Speed | Slower (overhead) | Faster |
| Use cases | HTTP, SSH, DB connections | DNS, video streaming, gaming |

### TCP 3-Way Handshake
```
Client → SYN → Server
Client ← SYN-ACK ← Server
Client → ACK → Server
Connection established!
```

### DNS Resolution
```
1. Browser checks local cache
2. OS checks /etc/hosts
3. Query → Recursive DNS resolver (ISP or 8.8.8.8)
4. Resolver → Root DNS (.com, .org, etc.)
5. Root → TLD nameserver (.com)
6. TLD → Authoritative nameserver (example.com)
7. Returns IP → Browser connects
```

### Key Networking Commands
```bash
ping google.com             # test connectivity
traceroute google.com       # trace network path
nslookup example.com        # DNS lookup
dig example.com             # detailed DNS query
curl -v https://api.com     # HTTP request with verbose output
wget https://file.com/f.zip # download file
netstat -tlnp               # listening ports and processes
ss -tlnp                    # modern netstat replacement
ip addr show                # show IP addresses
iptables -L                 # list firewall rules
```

### HTTP Status Codes (Must Know)
| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | POST created resource |
| 301 | Moved Permanently | URL redirect (cached) |
| 302 | Found (Temporary Redirect) | Temporary redirect |
| 400 | Bad Request | Invalid client input |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Authenticated but no permission |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Server Error | Server bug |
| 502 | Bad Gateway | Upstream server error |
| 503 | Service Unavailable | Server overloaded |
| 504 | Gateway Timeout | Upstream server timeout |

### SSL/TLS Handshake (Simplified)
```
1. Client → ClientHello (supported ciphers, TLS version)
2. Server → ServerHello (chosen cipher) + Certificate (public key)
3. Client verifies certificate against CA
4. Client generates session key, encrypts with server's public key
5. Both sides use session key for symmetric encryption
```

---

## Interview Questions

**Q: What happens when you type google.com in a browser?**
DNS resolution → TCP handshake → TLS handshake → HTTP GET → Server processes → Response → Browser renders HTML → Loads CSS/JS/images

**Q: Difference between `kill -9` and `kill -15`?**
`-15` (SIGTERM) = graceful shutdown, process can cleanup. `-9` (SIGKILL) = immediate force kill, no cleanup.

**Q: How do you troubleshoot a server that's slow?**
1. `top/htop` — check CPU, memory usage
2. `df -h` — check disk space
3. `free -h` — check RAM/swap
4. `netstat -tlnp` — check open connections
5. `tail -f /var/log/syslog` — check logs
6. `iostat` — check disk I/O bottleneck

**Q: What is a reverse proxy vs forward proxy?**
- **Forward proxy**: Client → Proxy → Internet (hides client, e.g., corporate proxy)
- **Reverse proxy**: Internet → Proxy → Backend servers (hides servers, e.g., Nginx, ALB)
