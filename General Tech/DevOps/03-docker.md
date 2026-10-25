# Docker & Containers — Interview Notes

## 1. Container vs VM vs Hypervisor

A **VM** is a virtual computer with its own CPU, memory, NIC, and storage, provisioned by a **hypervisor** (VMM) that abstracts hardware. Each VM runs a full guest OS — strong isolation, heavy overhead, minutes to boot. VMs are used for server consolidation and strong workload isolation.

A **container** packages code + dependencies into an isolated process that **shares the host OS kernel**. No guest OS, no virtualized hardware — MBs in size, starts in seconds.

| Aspect | Container | VM |
| -------- | ----------- | ----- |
| Isolation | Process-level (namespaces + cgroups) | Hardware-level (full guest OS) |
| Virtualizes | Operating system | Physical hardware |
| Startup | Milliseconds–seconds | Tens of seconds–minutes |
| Size | MBs | GBs |
| Kernel | Shared with host | One per VM |
| Density | 100s per host | 10s per host |
| Security boundary | Weaker (shared kernel) | Stronger (hypervisor) |

**Rule**: same trust domain + density/speed → containers. Untrusted multi-tenant or kernel-level isolation required → VMs (or VM-isolated containers: gVisor, Kata).

---

## 2. How Containers Achieve Isolation (Linux Primitives)

| Primitive | What it does |
| ----------- | -------------- |
| **Namespaces** | Isolates what a process *sees*: `pid`, `net`, `mnt`, `uts` (hostname), `ipc`, `user`, `cgroup`, `time` |
| **cgroups (v2)** | Limits/meters what a process *uses*: CPU, memory, block I/O, PIDs |
| **Union/overlay FS** | `overlay2` driver stacks read-only image layers + thin writable container layer |
| **Capabilities** | Splits root's powers; drop all, add back only what's needed |
| **seccomp** | Filters which syscalls the process may invoke |
| **AppArmor/SELinux** | Mandatory access control on file/network operations |

**Interview answer**: *"Containers are not lightweight VMs — they're regular Linux processes constrained by namespaces (view isolation) and cgroups (resource limits), with a layered union filesystem for packaging."*

---

## 3. Docker Architecture

```text
docker CLI  →  dockerd (daemon)  →  containerd  →  runc  →  Linux kernel
                                                     ↘ images (read-only layers)
                                                       containers (+ writable layer)
```

- **dockerd** — REST API daemon; builds images, manages networks/volumes.
- **containerd** — high-level runtime; pulls images, supervises containers. Also used directly by Kubernetes (Docker as K8s runtime deprecated since **v1.24**; dockershim removed).
- **runc** — low-level OCI runtime that actually creates the container via namespaces/cgroups.
- **Docker Desktop (Mac/Win)** — runs the daemon inside a lightweight Linux VM; that's why `localhost` port mapping behaves differently on macOS.

### What happens on `docker run` (interview sequence)

1. CLI sends `POST /containers/create` to dockerd.
2. Image pulled from registry if not cached locally.
3. containerd creates writable container layer over image layers.
4. Network namespace + veth pair wired to `docker0` bridge; iptables rules for port mapping.
5. Namespaces + cgroups applied; `runc` starts PID 1 with ENTRYPOINT/CMD.

---

## 4. Images, Layers & Build Cache

- Every Dockerfile instruction creates an **immutable layer**; layers are shared between images and reused via the build cache.
- A container adds a **thin writable layer** on top — copy-on-write, so containers are cheap.
- **Cache invalidation**: changing an instruction invalidates it and *every layer after it*. Order Dockerfile steps from least→most frequently changed.

```text
✅ COPY package*.json → RUN npm ci → COPY . .   (deps cached across code changes)
❌ COPY . . → RUN npm ci                        (cache busted on every code change)
```

- `.dockerignore` shrinks build context (faster uploads, avoids leaking `.git`/secrets into layers).
- **Secrets don't belong in layers** — `RUN export KEY=...` and `COPY .env` are recoverable via `docker history`. Use BuildKit `--mount=type=secret`.

### Image vs Container

| | Image | Container |
| --- | ------- | ----------- |
| Nature | Immutable, layered template | Mutable runtime instance (+ writable layer) |
| Analogy | Class | Object |
| Storage | Registry + local layer cache | Host disk until removed |
| Count | One image → many containers | Many per image, each with own state |

---

## 5. Dockerfile — Instructions & Best Practices

| Instruction | Purpose |
| ------------- | --------- |
| `FROM` | Base image (always first; pin version/digest, never `:latest` in prod) |
| `RUN` | Executes commands at **build** time (new layer) |
| `COPY` | Copy files from build context (prefer over ADD) |
| `ADD` | COPY + auto-extracts tars + can fetch URLs (avoid; unpredictable) |
| `CMD` | Default command/args — **overridden** by `docker run img <cmd>` |
| `ENTRYPOINT` | Fixed executable; `CMD` becomes its default args |
| `WORKDIR` | Sets working dir (creates it; prefer over `RUN cd`) |
| `ENV` | Build+runtime env vars |
| `ARG` | Build-time-only variable (not in final image env) |
| `EXPOSE` | Documents port; does **not** publish it (`-p` does) |
| `HEALTHCHECK` | `HEALTHCHECK CMD curl -f http://localhost:8080/health \|\| exit 1` |
| `USER` | Run as non-root |

### CMD vs ENTRYPOINT (classic follow-up)

```dockerfile
ENTRYPOINT ["python"]          # always runs
CMD ["app.py"]                 # default arg, replaceable at runtime
# docker run img            → python app.py
# docker run img worker.py  → python worker.py
```

### The PID 1 Problem in Containers (Signal Handling & Zombie Reaping)

In Linux, **PID 1** inside a PID namespace has two special kernel rules:

1. **Default signal handlers are ignored**: PID 1 will **ignore `SIGTERM`** unless the process explicitly registers a signal handler in code.
2. **Orphan adoption**: Any child process whose parent dies is re-parented to PID 1. If PID 1 doesn't call `wait()`, dead children pile up as **zombie processes (`Z`)** until PID limit exhaustion.

| Dockerfile Syntax | What runs as PID 1 | Signal / Zombie Behavior |
| --- | --- | --- |
| **Shell form**: `CMD node server.js` | `/bin/sh -c "node server.js"` | **BROKEN**: `/bin/sh` does NOT forward `SIGTERM` to `node` → `docker stop` / K8s pod eviction hangs for 30s (`terminationGracePeriodSeconds`) then `SIGKILL`s (137) |
| **Exec form**: `CMD ["node", "server.js"]` | `node` directly | `node` receives `SIGTERM`, **but** runtimes like Node/Java/Python don't reap arbitrary reparented OS subprocesses |
| **Init wrapper**: `ENTRYPOINT ["/sbin/tini", "--", "node", "server.js"]` (or `docker run --init`) | `tini` / `dumb-init` (tiny init binary) | **GOLD STANDARD**: forwards signals cleanly to child group AND reaps all zombie processes |

### Base Image Choice — `alpine` (musl) vs `debian-slim` (glibc) vs `distroless`

| Base | C Library | Size | Production Trade-offs & Gotchas |
| --- | --- | --- | --- |
| `alpine` | **musl libc** | ~5 MB | Tiny, has `apk` + `busybox` shell. **Gotchas**: `musl` DNS resolver had historic parallel A/AAAA query quirks on K8s; Python wheels (`manylinux`) compile from source if no musl wheel; smaller thread stack size can segfault JNI/Cgo |
| `debian-slim` / `ubuntu` | **glibc** | ~70–80 MB | Standard `glibc` compatibility, predictable DNS (`nsswitch.conf`), fast prebuilt Python/C++ wheels; larger CVE surface |
| `gcr.io/distroless/*` | **glibc** (stripped) | ~20–50 MB | **No shell, no package manager**, minimal CVEs — attacker can't `exec /bin/sh`. Debug via `kubectl debug --image=busybox` ephemeral containers |
| `scratch` | None (empty) | 0 MB | Only for statically linked binaries (`CGO_ENABLED=0 go build`, Rust) — don't forget to copy `/etc/ssl/certs/ca-certificates.crt` or HTTPS calls fail! |

### Multi-stage build (from reference — canonical answer)

```dockerfile
# Stage 1: build
FROM golang:1.22 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o myapp .

# Stage 2: runtime — only the binary ships
FROM alpine:3.20
WORKDIR /app
COPY --from=builder /app/myapp .
USER 65534            # nobody
CMD ["./myapp"]
```

Result: build toolchain (~1 GB) never reaches the image; final image can be tens of MB. Same pattern for Node (`node:20` build → `node:20-alpine` or `distroless` runtime).

### Hardened Dockerfile (best practices assembled)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY . .
RUN addgroup -S app && adduser -S app -G app
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "server.js"]        # exec form → PID 1 gets signals
```

---

## 6. Debugging a Failing Container (ordered sequence)

1. `docker ps -a` — get exit code (`Exited (137)` = SIGKILL/OOM, `(1)` = app error, `(127)` = cmd not found).
2. `docker logs <c>` — stdout/stderr (app's actual error).
3. `docker inspect <c>` — full config: entrypoint, env, mounts, `State.OOMKilled`.
4. `docker exec -it <c> sh` — if running; for crashed ones, `docker run -it --entrypoint sh img`.
5. `docker events` — real-time daemon events (OOM kill, die, restart).
6. `docker stats` — CPU/memory ceiling hits.
7. `docker network inspect` + `docker exec … curl/ping` — connectivity.
8. Daemon side: `journalctl -u docker -f` or daemon `-D` debug flag.

---

## 7. Storage — Volumes vs Bind Mounts vs tmpfs

| | Volume | Bind mount | tmpfs |
| --- | -------- | ----------- | ------- |
| Managed by | Docker (`/var/lib/docker/volumes/`) | You (host path) | RAM only |
| Survives container removal | Yes | Yes (it's host data) | No |
| Portability | High | Host-dependent | — |
| Use case | **Prod persistence** (databases) | Dev (live code reload), host config | Secrets, scratch |

```bash
docker volume create mydata
docker run -v mydata:/var/lib/postgresql/data postgres:16
docker run --mount type=bind,src=$PWD,dst=/app nginx
docker run --tmpfs /run/lock nginx
```

**Storage drivers**: `overlay2` is the default and recommended on modern kernels; legacy: `aufs`, `devicemapper`, `btrfs`, `zfs`.

---

## 8. Networking Modes

| Mode | Behavior | Use case |
| ------ | ---------- | ---------- |
| `bridge` (default) | Private `docker0` network; NAT; `-p` publishes ports | Normal apps |
| `host` | Shares host net namespace; no isolation, `-p` ignored | Perf-sensitive, debugging |
| `none` | No NIC except loopback | Offline jobs |
| `overlay` | VXLAN-encrypted multi-host network | Swarm services |
| `macvlan` | Container gets real MAC/IP on LAN | Legacy apps needing own IP |
| `container:<c>` | Shares another container's netns | Sidecars (like K8s pods) |

- Containers on the same **user-defined bridge** resolve each other by **name** via embedded DNS at `127.0.0.11`. The default `docker0` bridge only does IP resolution (links deprecated).
- Override DNS with `--dns`; static entry with `--add-host name:ip`.

---

## 9. Logging Drivers & Restart Policies

| Driver | Destination | When |
| -------- | ------------- | ------ |
| `json-file` (default) | Local JSON files (rotate via `max-size`/`max-file`) | Dev/small |
| `local` | Compressed local | Disk-efficient default |
| `syslog`/`journald` | Syslog daemon / systemd journal | Infra-managed logs |
| `fluentd` | Fluentd aggregator | Centralized/EFK |
| `awslogs`/`gcplogs`/`gelf` | CloudWatch / Google / Graylog-Logstash | Cloud/SaaS backends |

```bash
docker run --log-driver fluentd --log-opt fluentd-address=localhost:24224 app
docker logs app   # ⚠️ only works with json-file/local — plan accordingly
```

| Restart policy | Behavior |
| ---------------- | ---------- |
| `no` (default) | Never restart |
| `always` | Always, incl. after daemon restart |
| `unless-stopped` | Always, except manually stopped |
| `on-failure[:N]` | Only on non-zero exit, optional max retries |

---

## 10. Security — Docker Daemon & Image

- **Daemon socket = root on host.** `/var/run/docker.sock` mounted into a container is effectively host-root. Restrict access; never expose `-H tcp://0.0.0.0:2375` unauthenticated — use **TLS on 2376**.
- **`--userns-remap`** maps container root → unprivileged host UID (default-off; big win).
- Drop capabilities: `--cap-drop ALL --cap-add NET_BIND_SERVICE`; add `--read-only`, `--security-opt no-new-privileges`.
- **Docker Content Trust** (`DOCKER_CONTENT_TRUST=1`) enforces signed-image pulls (Notary/DCT; modern alternative: **cosign** verify in admission).
- Secrets: Swarm `docker secret create`; non-Swarm → env-inject from Vault/AWS SM or `.env` files (600 perms, gitignored).
- Scan images in CI (Trivy/Grype) + registry-side scanning; rebuild on base-image CVEs.

---

## 11. Comparisons Interviewers Love

### Dockerfile vs docker-compose.yml

| | Dockerfile | Compose file |
| --- | ----------- | -------------- |
| Scope | Builds **one image** | Runs **multi-container app** on one host |
| Contents | Build steps (FROM/RUN/COPY/CMD) | Services, networks, volumes, ports, env, deps |
| Command | `docker build` | `docker compose up` |
| Use when | You need a custom image | You need containers wired together locally |

### Docker vs Podman vs containerd

| | Docker | Podman | containerd |
| --- | -------- | -------- | ------------ |
| Daemon | dockerd (root) | **Daemonless**, rootless-first | Daemon (runtime, not a UX) |
| CLI | `docker` | `podman` (docker-compatible) | `ctr`/`crictl` (low-level) |
| Role | Full dev platform | Drop-in docker alternative | Runtime used *by* Docker/K8s |

### Compose vs Swarm vs Kubernetes

| | Compose | Swarm | Kubernetes |
| --- | --------- | ------- | ------------ |
| Scope | Single host | Small multi-host | Datacenter-scale |
| HA/self-heal | Restart policies only | Basic | Full (reconcile loops, HPA, PDB) |
| Learning | Trivial | Low | Steep |
| Status | Dev/CI standard | Maintenance mode (Mirantis) | Industry standard |

### Docker build time/size levers (ranked)

1. Multi-stage builds (biggest single win)
2. Minimal base (`alpine`, `distroless`, `scratch` for static binaries)
3. Layer ordering for cache hits + `.dockerignore`
4. `--omit=dev` / no build tools in final stage; combine `RUN` chains (`&&`)
5. BuildKit: `DOCKER_BUILDKIT=1` — parallel stages, cache mounts (`--mount=type=cache`), secret mounts
6. Multi-arch: `docker buildx build --platform linux/amd64,linux/arm64 --push`

---

## 12. Compose Reference + Commands

```yaml
services:                    # version: key is obsolete in Compose v2
  web:
    build: .
    ports: ["3000:3000"]
    environment: [DB_HOST=db]
    depends_on: [db]
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      retries: 3
  db:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_PASSWORD: secret
volumes:
  pgdata:
```

```bash
docker compose up -d            # start all (v2: no hyphen)
docker compose down             # stop + remove (-v also drops volumes)
docker compose logs -f web
docker compose exec web sh
docker compose up --scale web=3 # manual scaling
```

### Command cheat sheet (from source notes)

```bash
# containers
docker ps | ps -a | start|stop|rm <id> | logs [-f] | exec -it <id> bash | inspect | stats
# images
docker images | pull | build -t app:1.0 . | tag | push | rmi | image prune -a
# system
docker system df | docker system prune -a --volumes   # careful: wipes everything unused
docker compose up -d | down | ps | logs -f
```

---

## 13. Recall — Sound Bites

- "A container is a **process with a viewpoint problem** — namespaces lie to it, cgroups limit it, overlayfs packages it."
- "Image = class, container = object; layers are immutable and shared."
- "`CMD` is a default arg; `ENTRYPOINT` is the binary. Together: `ENTRYPOINT` runs, `CMD` feeds it."
- "Docker socket ≈ host root — TLS, userns-remap, cap-drop ALL, read-only rootfs."
- "Cache order: deps first, code last. Multi-stage: toolchain stays in stage 1."
- "Docker builds/runs containers; K8s orchestrates them across nodes. Compose runs them on one node."
- Debug sequence to recite: `ps -a → logs → inspect → exec → events → stats → network`.
