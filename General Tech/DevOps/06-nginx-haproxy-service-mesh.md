# Nginx, HAProxy, Envoy & Service Mesh — Interview Deep Dive

## 1. L4 vs L7 Load Balancing & Proxy Fundamentals

```text
L4 Load Balancer (TCP/UDP — NLB, HAProxy mode tcp, IPVS, MetalLB)
  Client ──TCP SYN──▶ LB picks backend by 5-tuple hash/round-robin ──▶ Backend Pod
  (Fastest, packet/connection level, no HTTP parsing, cannot route by URL path/header, sticky HTTP/2 gRPC trap!)

L7 Reverse Proxy / Load Balancer (HTTP/gRPC — Nginx, HAProxy mode http, Envoy, ALB)
  Client ──TLS + HTTP──▶ Proxy terminates TLS, parses HTTP headers/path/cookies
                       ──▶ Routes /api → svc-a, /static → S3, enforces rate-limit/WAF/retries
                       ──▶ Pools keepalive connections to upstream backends
```

| Feature | **Nginx** | **HAProxy** | **Envoy** | **AWS ALB / NLB** |
| --- | --- | --- | --- | --- |
| **Origins / Sweet Spot** | Web server (static files) + L7 reverse proxy + K8s Ingress | Pure high-perf L4/L7 load balancer & TCP/HTTP routing | Cloud-native L4/L7 proxy, **xDS dynamic API**, Service Mesh data plane | Managed cloud edge LB (ALB=L7, NLB=L4) |
| **Config Reload** | `nginx -s reload` forks new worker processes, drains old workers (careful: high reload churn in K8s drops long connections!) | Hitless reload (`-sf` socket transfer) + Runtime Socket API for dynamic backend weight/state changes | **100% dynamic via xDS gRPC API** — zero process reloads when K8s endpoints change | Managed via AWS API / ALB Controller |
| **Observability** | Basic stub_status (OSS); rich metrics in Nginx Plus / Prometheus exporter | Built-in HTML/CSV stats page + Prometheus endpoint (`/metrics` natively since 2.0) | First-class histograms, distributed tracing (OpenTelemetry), L7 gRPC/HTTP stats out-of-the-box | CloudWatch metrics + S3 access logs |
| **gRPC / HTTP/2** | Supported (`grpc_pass`), less dynamic circuit-breaking | Full HTTP/2 + gRPC, ultra-fast ACLs + stick-tables | **Best-in-class gRPC**, outlier detection, circuit breaking, retry budgets, shadowing | ALB supports gRPC target groups |
| **Choose when** | Serving static assets + reverse proxy + standard K8s Ingress | Extreme L4/L7 throughput, TCP DB load balancing (PgBouncer/Galera/Redis), fine ACL/stick-table rate-limiting | Service mesh sidecar/gateway (Istio/Cilium/Contour), dynamic microservice routing | Cloud edge termination on AWS |

---

## 2. Nginx — Architecture, Directives & Production Tuning

### Event-Driven Architecture (Why Nginx Beats Apache `prefork` Under C10K+)

- **Master process** (runs as `root` to bind port 80/443, reads/validates config, spawns/manages workers, never handles user traffic).
- **Worker processes** (run as unprivileged `nginx` user, typically `worker_processes auto` = 1 per CPU core, pinned via `worker_cpu_affinity`).
- Each worker is **single-threaded, non-blocking, asynchronous event loop** using Linux **`epoll`**: a single worker handles `worker_connections 10240+` concurrent connections with a few MB of RAM, instead of spawning 1 thread/process per connection.

### Essential Production `nginx.conf` Anatomy (Memorize the Gotchas)

```nginx
worker_processes auto;
worker_rlimit_nofile 65535;          # MUST exceed worker_connections * 2 (client + upstream FD!)

events {
    worker_connections 16384;
    use epoll;
    multi_accept on;
}

http {
    sendfile on;                     # zero-copy kernel file transfer (bypasses user-space buffer)
    tcp_nopush on;                   # send headers + file start in one packet
    tcp_nodelay on;                  # disable Nagle's algorithm for low-latency small responses
    keepalive_timeout 65;

    # Rate limiting: 10MB shared memory (~160k IPs), 20 req/sec per client IP
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;

    upstream backend_api {
        least_conn;                  # default is round-robin; least_conn better for variable latency
        server 10.0.1.10:8080 max_fails=3 fail_timeout=10s;
        server 10.0.1.11:8080 max_fails=3 fail_timeout=10s;
        keepalive 64;                # CRITICAL: pool idle keepalive conns to upstream!
    }

    server {
        listen 443 ssl http2;
        server_name api.example.com;

        location /api/ {
            limit_req zone=api_limit burst=40 nodelay;

            proxy_pass http://backend_api;
            proxy_http_version 1.1;              # REQUIRED for upstream keepalive (default is HTTP/1.0!)
            proxy_set_header Connection "";      # REQUIRED to clear "close" header for upstream keepalive
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            proxy_connect_timeout 3s;
            proxy_read_timeout 30s;
            proxy_next_upstream error timeout http_502 http_503; # careful: don't retry non-idempotent POSTs!
        }
    }
}
```

### Top 3 Nginx Interview Traps

1. **The Upstream Keepalive Trap**: By default, Nginx speaks **HTTP/1.0 with `Connection: close`** to upstreams — opening a brand-new TCP connection (and TLS handshake if HTTPS) to your backend on *every single request*, exhausting ephemeral ports (`TIME_WAIT`). Fix: add `keepalive 64;` inside `upstream {}` **AND** `proxy_http_version 1.1; proxy_set_header Connection "";` inside `location {}`.
2. **The Static DNS Resolution Trap**: If you write `proxy_pass http://my-internal-alb.elb.amazonaws.com;`, Nginx resolves that DNS hostname **only once at startup/reload** and caches the IPs forever! When AWS rotates ALB IPs or K8s pods change, Nginx sends traffic to dead IPs (`502 Bad Gateway`). Fix: declare `resolver 10.96.0.10 valid=10s;` and store the hostname in a variable (`set $upstream "my-svc.ns.svc.cluster.local"; proxy_pass http://$upstream;`) to force dynamic TTL-based re-resolution.
3. **`location` Matching Priority Order**:
   1. `location = /exact` (exact match — stops immediately, fastest)
   2. `location ^~ /prefix` (preferential prefix — stops before regex evaluation)
   3. `location ~ /regex` or `~* /case-insensitive-regex` (evaluated in **file order**, first match wins!)
   4. `location /prefix` (longest standard prefix match)

---

## 3. HAProxy — Architecture, Stick-Tables & Health Checks

### Why SREs Love HAProxy

- **Stick-Tables**: High-speed in-memory key-value tables built into the data plane that track per-IP/per-header sliding-window counters (`http_req_rate(10s)`, `http_err_rate(10s)`, `conn_cur`, `bytes_out_rate`) across active-active HAProxy peers — lets you tarpit or `429` abusive clients or bots at 1M+ RPS without touching Redis.
- **Granular Timeouts & Queuing**:
  - `timeout connect 3s` (TCP SYN to backend) · `timeout client 30s` · `timeout server 30s` · `timeout http-keep-alive 10s` · `timeout queue 5s`
  - **`maxconn` per backend server**: HAProxy can cap concurrent connections sent to each backend (`server app1 10.0.1.10:8080 check maxconn 100`) and queue excess requests inside HAProxy instead of melting down a thread-per-request backend (Ruby/Python/legacy Java).
- **Drain vs Maint**: Setting a server to `drain` via the HAProxy runtime socket (`echo "set server web_back/app1 state drain" | socat stdio /var/run/haproxy.sock`) stops new connections while letting existing sessions/keepalives finish cleanly; `maint` drops it immediately.

```haproxy
frontend https_in
    bind *:443 ssl crt /etc/ssl/certs/site.pem alpn h2,http/1.1
    mode http
    # Track per-IP request rate over 10s; reject if > 100 req/10s
    stick-table type ip size 1m expire 30s store http_req_rate(10s),conn_cur
    http-request track-sc0 src
    http-request deny deny_status 429 if { sc_http_req_rate(0) gt 100 }

    acl is_api path_beg /api
    use_backend api_pool if is_api
    default_backend web_pool

backend api_pool
    mode http
    balance leastconn
    option httpchk GET /actuator/health/readiness
    http-check expect status 200
    default-server inter 3s fall 3 rise 2 maxconn 250
    server api1 10.0.3.11:8080 check
    server api2 10.0.3.12:8080 check
```

---

## 4. Service Mesh (Istio, Linkerd, Cilium) — What You Must Know

### What Problem Does a Service Mesh Actually Solve?

In a 100-microservice architecture, every service needs **mTLS encryption, service-to-service authorization, L7 retries with backoff, circuit breaking, timeouts, canary traffic splitting, and golden-signal metrics/tracing**. Coding that into Java + Python + Go + Node libraries creates version drift. A **Service Mesh** moves that logic out of app code into an infrastructure proxy layer.

### Architecture — Control Plane vs Data Plane

```text
Control Plane (istiod / linkerd-destination / cilium-operator)
  ├── Watches Kubernetes API (Services, EndpointSlices, VirtualServices, AuthorizationPolicies)
  ├── Built-in CA: issues & rotates short-lived SPIFFE X.509 workload certs (spiffe://cluster.local/ns/prod/sa/payment)
  └── Pushes config + certs to Data Plane proxies via xDS gRPC API

Data Plane (Option A: Sidecar Model — Istio Classic, Linkerd)
  Pod: [ init-container (iptables redirect) ] + [ Envoy / linkerd2-proxy sidecar ] <──localhost──> [ App Container ]
  Every inbound & outbound packet is intercepted via iptables/eBPF → sidecar enforces mTLS, L7 policy, telemetry

Data Plane (Option B: Sidecarless / Ambient Model — Istio Ambient, Cilium Service Mesh)
  Node: [ ztunnel (per-node L4 mTLS DaemonSet) ] + optional [ Waypoint Envoy Proxy (L7 per-namespace/SA) ]
  Eliminates per-pod sidecar memory overhead & app/sidecar upgrade coupling!
```

### Istio Core CRDs (Asked in Almost Every Mesh Interview)

| CRD | Role | Example Use |
| --- | --- | --- |
| **`Gateway`** | Configures north-south edge Envoy load balancer (ports, TLS certs, hosts) | Terminate TLS for `api.example.com:443` at the mesh edge |
| **`VirtualService`** | Defines **HOW** traffic is routed to a destination (path/header match, weighted canary split, retries, timeouts, fault injection) | Route 95% to `v1`, 5% to `v2`; or route `x-beta-user: true` to `v2`; inject 5s delay on 1% of requests for chaos testing |
| **`DestinationRule`** | Defines policies applied **AFTER** routing is chosen: subset definitions (`v1`, `v2` by pod labels), load-balancer algorithm, connection pool limits, **OutlierDetection (circuit breaker)**, TLS mode (`ISTIO_MUTUAL`) | Eject any pod returning 5 consecutive `5xx` errors for `30s` (`consecutive5xxErrors: 5`, `baseEjectionTime: 30s`) |
| **`PeerAuthentication`** | Enforces mTLS mode per mesh/namespace/workload | `mtls: { mode: STRICT }` (reject plaintext) vs `PERMISSIVE` (accept both during migration) |
| **`AuthorizationPolicy`** | L7 RBAC between services based on cryptographic SPIFFE identity + HTTP method/path/JWT claims | Allow only `spiffe://cluster.local/ns/prod/sa/checkout` to `POST /charge` on `payment-svc` |
| **`ServiceEntry`** | Registers external services (e.g., `api.stripe.com`, external Oracle DB) into the mesh registry | Control/observe egress traffic through an Istio Egress Gateway |

### Istio vs Linkerd vs Cilium vs Consul / App Mesh / Kuma (X vs Y)

| Mesh | Data Plane | Control Plane | Cloud / Platform Focus & Trade-offs |
| --- | --- | --- | --- |
| **Istio (Sidecar / Ambient)** | **Envoy** (C++) or `ztunnel` (Rust) + Waypoint | `istiod` | K8s-heavy + hybrid VMs; richest CRD surface; ~50–100MB/pod in sidecar mode (low in Ambient); **~2.5ms baseline mTLS latency** |
| **Linkerd** | **`linkerd2-proxy`** (purpose-built Rust) | `linkerd-control` | K8s-only; simpler, lighter (~15–20MB/pod, sub-ms p99 latency), Gateway API native |
| **Cilium Service Mesh** | **eBPF in kernel** (L3/L4) + **Envoy per-node** (L7) | `cilium-operator` | Replaces CNI + `kube-proxy` + Mesh in one stack; zero sidecar overhead for L4 |
| **Consul Service Mesh** | Envoy | Consul | Multi-platform (bridging legacy VMs + Kubernetes) |
| **AWS App Mesh** | Envoy | AWS Cloud | ECS, EKS, EC2 AWS-native |
| **Kuma / Kong Mesh** | Envoy | Universal (`kuma-cp`) | Multi-cluster, multi-zone universal mesh |

### Service Mesh vs API Gateway (Complementary, Not Competing)

| Attribute | **Service Mesh** | **API Gateway** |
| --- | --- | --- |
| **Traffic scope** | **East–West** (service-to-service inside cluster/mesh) | **North–South** (external client-to-service at edge) |
| **Security** | mTLS everywhere (`STRICT` / `PERMISSIVE`), SPIFFE identity, L7 RBAC | OAuth2/OIDC login, API keys, WAF, edge rate-limiting |
| **Observability** | Full internal service-to-service dependency graph (Kiali, Jaeger, Prometheus) | Edge entry metrics & access logs only |
| **Deployment** | Sidecars per pod or per-node eBPF/`ztunnel` | Edge perimeter proxy |

**When to Use vs Avoid a Service Mesh**:

- **Use when**: 15+ microservices, strict zero-trust/mTLS compliance, canary/A-B traffic shaping, multi-cluster/hybrid VM+K8s routing (via **Istio Mesh Gateway** + Istio agent on VMs), or polyglot stacks where per-language retry/auth libraries drift.
- **Avoid when**: small system/monolith, no east-west mTLS/traffic-shaping requirement, or low Kubernetes operational maturity.

---

## 5. Envoy Filters & WebAssembly (Wasm) — The Enforcement Engine of Istio

Istio **does not** route packets itself — `istiod` compiles high-level CRDs (`VirtualService`, `DestinationRule`, `PeerAuthentication`, `RequestAuthentication`, `AuthorizationPolicy`, `EnvoyFilter`) into **Envoy filter configurations** and pushes them dynamically via the **xDS gRPC API** with zero proxy restarts.

### Envoy Filter Pipeline Order

```text
Inbound / Outbound Packet
  ──▶ Listener
        ──▶ Listener Filters (e.g. TLS inspector — detects TLS/ALPN/protocol)
              ──▶ FilterChain
                    ──▶ Network Filters (L4: tcp_proxy, sni_cluster, client_ssl_auth, L4 RBAC)
                          ──▶ HTTP Connection Manager (L7 HTTP Filters: cors, jwt_authn, rbac, fault, Wasm, ext_authz, metadata_exchange, stats)
                                ──▶ Router (forwards to upstream cluster/subset)
```

### Built-in & Istio-Injected Envoy Filters

| Envoy / Istio Filter | Layer | Purpose |
| --- | --- | --- |
| `envoy.filters.listener.tls_inspector` | Listener | Inspects TLS ClientHello (SNI, ALPN) before choosing FilterChain |
| `envoy.filters.network.sni_cluster` / `client_ssl_auth` | Network (L4) | SNI routing for mTLS & peer certificate identity verification |
| `envoy.filters.http.jwt_authn` | HTTP (L7) | Verifies JWT signature against `jwksUri` (injected by `RequestAuthentication`) |
| `envoy.filters.http.rbac` | HTTP (L7) | Enforces L7 service-to-service RBAC (injected by `AuthorizationPolicy`) |
| `envoy.filters.http.fault` | HTTP (L7) | Injects delays and HTTP abort codes (injected by `VirtualService.http.fault`) |
| `envoy.filters.http.cors` | HTTP (L7) | Enforces CORS policies |
| `istio.metadata_exchange` & `istio.stats` | HTTP (L7) | Exchanges peer workload metadata & emits Prometheus golden-signal metrics |

### Real Example 1: Custom Header Injection via `EnvoyFilter` CRD

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: add-custom-header
spec:
  workloadSelector:
    labels: { app: my-service }
  configPatches:
    - applyTo: HTTP_FILTER
      match:
        context: SIDECAR_INBOUND
        listener:
          filterChain:
            filter:
              name: "envoy.filters.network.http_connection_manager"
      patch:
        operation: INSERT_BEFORE
        value:
          name: "envoy.filters.http.header_to_add"
          typed_config:
            "@type": "type.googleapis.com/envoy.extensions.filters.http.header_to_add.v3.Config"
            header: { key: "x-custom", value: "experimental" }
```

### Real Example 2: Enforce JWT Authentication (`RequestAuthentication`)

```yaml
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: jwt-auth
spec:
  selector:
    matchLabels: { app: my-service }
  jwtRules:
    - issuer: "https://auth.example.com"
      jwksUri: "https://auth.example.com/.well-known/jwks.json"
```

### Custom Business Logic (`WasmPlugin` CRD) & Debugging Envoy Filters

- **WebAssembly (`WasmPlugin`)**: Write custom L7 filters (PII redaction, custom hmac auth, custom logging) in Rust, TinyGo, or C++ and deploy via `WasmPlugin` CRD — runs sandboxed inside Envoy without compiling custom proxy binaries or fragile Lua scripts.
- **Debugging live Envoy filter state**:

  ```bash
  kubectl exec <pod> -c istio-proxy -- pilot-agent request GET config_dump > dump.json
  # Inspect "listener_filters" and "http_filters" in dump.json to verify EnvoyFilter patches
  istioctl proxy-status                        # check CDS/LDS/EDS/RDS sync status across all pods
  istioctl analyze -n <ns>                     # detect conflicting VirtualServices / missing subsets
  ```

- **When EnvoyFilters Go Wrong** (always test in one namespace first):
  - *Infinite `503`s* → wrong routing filter order (`INSERT_BEFORE` placed after `envoy.filters.http.router`).
  - *Broken TLS handshake* → bad listener/network filter match.
  - *App unreachable* → inbound `filterChain` port/protocol mismatch.
  - *Sidecar CPU spikes* → heavy regex or unoptimized Wasm filter on every request.

---

## 6. Circuit Breaker & Distributed Resilience Patterns

A **Circuit Breaker** prevents a slow or failing downstream dependency from exhausting caller connection pools/threads and causing a cascading outage — **failing fast** instead of waiting for timeouts.

### State Machine (`Closed → Open → Half-Open`) & Control Parameters

| State | Behavior | Transition Trigger |
| --- | --- | --- |
| **Closed** | Requests pass through normally; error counter tracks failures | Trips to **Open** when `Failure Threshold` exceeded (e.g., 5 consecutive 5xx or >50% errors in 10s) |
| **Open** | Rejects requests **immediately** (fail-fast / invoke fallback) | Transitions to **Half-Open** after `Timeout Duration` (`baseEjectionTime`, e.g., 30s) |
| **Half-Open** | Allows a small number of trial requests (`1–3` probes) | If probes succeed → **Closed**; if any probe fails → re-opens with exponential backoff (`30s → 60s → 120s`) |

### Circuit Breaker vs Retry vs Other Resilience Patterns (All Work Together)

| Pattern | When Used | Behavior | Impact on Failing Downstream |
| --- | --- | --- | --- |
| **Circuit Breaker** | Persistent downstream failure / high latency | Stops calling downstream; fails fast (`503 UO` in Envoy) | **Reduces load** so downstream can recover |
| **Retry Policy** | Transient network blip / single-pod hiccup | Retries with exponential backoff + jitter | **Increases load** (dangerous without a retry budget / breaker!) |
| **Timeout** | Slow dependency | Aborts call after deadline (`downstream < upstream`) | Frees caller thread/socket |
| **Bulkhead** | Resource isolation per dependency | Dedicates separate thread/connection pool per downstream | Contains blast radius so one dead API can't starve others |
| **Rate Limiter / Load Shedder** | Traffic spike / DDoS | Rejects excess traffic (`429`) at edge/caller | Caps max concurrency |

- **Where Circuit Breakers Run**: Always at the **caller/client side** (API Gateway, BFF, calling microservice via Resilience4j, Envoy sidecar via Istio `DestinationRule.trafficPolicy.outlierDetection`, or client SDK).
- **Fallback Strategies When Open**: (1) Serve stale **cached response** (e.g., last known recommendations), (2) Return safe **default response**, (3) Route to **backup read replica / secondary provider**, or (4) Queue asynchronously (e.g., payment retry queue) / return graceful `"Service busy, retry later"`.

---

## 7. Real-Life Production Case Studies (Interview Scenarios)

### Case Study 1: Intermittent `502 Bad Gateway` Behind Nginx / ALB UnderNormal Load

- **Symptom**: 0.5% of requests fail with `502 Bad Gateway` during quiet periods and traffic ramps; backend app logs show **zero errors** (the request never reached the app handler).
- **Root Cause**: **Keepalive Idle Timeout Race Condition**. The Load Balancer (ALB or Nginx) had an upstream idle keepalive timeout of `60s`, while the backend server (Node.js default `keepAliveTimeout = 5000ms` or Spring Boot Tomcat `connection-timeout = 20s`) closed the idle TCP connection at `5s`/`20s`. At the exact millisecond the backend sent a TCP `FIN` to close the idle socket, the LB reused that socket to forward a new HTTP request → kernel replied `RST` → LB returned `502`.
- **Fix**: **Always set `Backend Idle Timeout > Load Balancer Idle Timeout`** (e.g., ALB idle timeout = `60s`, Nginx/App `keepAliveTimeout = 65s`, `headersTimeout = 66s`).

### Case Study 2: K8s Ingress-Nginx Latency Spikes & Dropped WebSockets During High Deploy/Autoscale Churn

- **Symptom**: Every time HPA scales pods or deployments roll out, p99 latency jumps and long-lived WebSocket/gRPC streams disconnect across unrelated services.
- **Root Cause**: Previously, every Endpoint change caused `ingress-nginx` to rewrite `nginx.conf` and run `nginx -s reload`, forking new workers and keeping old "shutting-down" workers in memory holding open connections (consuming 2–4× RAM until OOMKilled or `worker-shutdown-timeout` killed the connections).
- **Fix**: Enable **`ingress-nginx` Lua dynamic upstream endpoints** (which updates endpoints in shared memory via Lua without reloading Nginx workers when only pod IPs change), tune `worker-shutdown-timeout`, or migrate to an Envoy/Gateway API controller (which updates endpoints dynamically via xDS without reloads).

### Case Study 3: Istio Sidecar Startup Race Condition (`Connection refused` in Init / Job Pods)

- **Symptom**:1. App container starts faster than `istio-proxy` sidecar and immediately fails trying to connect to Postgres/Vault during boot (`Connection refused`). 2. Kubernetes `Job` pods finish their work, main container exits `0`, but the Pod stays `Running (1/2)` forever because `istio-proxy` never exits!
- **Fix**:
  1. Enable **`holdApplicationUntilProxyStarts: true`** (or K8s 1.28+ native sidecar containers `restartPolicy: Always` in `initContainers`) so Envoy is ready before the app container starts.
  2. For `Job` pods: either call `POST http://localhost:15020/quitquitquit` at the end of the job script to shut down Envoy, or use native K8s sidecars (which K8s automatically terminates once all main Job containers exit `0`).

### Case Study 4: Envoy `503 UC` vs `503 UF` vs `503 UO` Debugging

When Istio/Envoy returns a `503`, the **Envoy Response Flag** in the access log tells you the exact root cause in 5 seconds:

- **`UF` (Upstream Connection Failure)**: Envoy couldn't establish TCP/mTLS to the pod (wrong port, `PeerAuthentication` STRICT vs plaintext mismatch, NetworkPolicy blocking).
- **`UC` (Upstream Connection Termination)**: Backend pod closed the connection prematurely before sending response headers (keepalive timeout race, or pod killed by SIGKILL during rollout without `preStop` sleep).
- **`UO` (Upstream Overflow)**: Envoy **Circuit Breaker** tripped (`DestinationRule` `maxConnections` or `maxPendingRequests` exceeded).
- **`NR` (No Route Configured)**: `VirtualService` host/subset doesn't match any `DestinationRule` subset.

---

## 8. Recall — Sound Bites

- "Nginx defaults to HTTP/1.0 `Connection: close` on upstreams — add `keepalive` + `proxy_http_version 1.1` or drown in `TIME_WAIT`."
- "Backend keepalive timeout must ALWAYS be greater than the Load Balancer's idle timeout, or you get race-condition `502`s."
- "Nginx caches upstream DNS at startup unless you use `resolver` + a `$variable` in `proxy_pass`."
- "HAProxy stick-tables rate-limit abusive IPs in-memory at 1M+ RPS; Envoy xDS updates endpoints with zero process reloads."
- "Istio: `Gateway` = edge door, `VirtualService` = routing rules, `DestinationRule` = subset/circuit-breaker policy after routing."
- "Envoy access log flags: `UF` = connect/mTLS failed, `UC` = backend closed early (keepalive/SIGTERM race), `UO` = circuit breaker tripped."
