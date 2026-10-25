# Kubernetes Networking — Interview Notes

## 1. The Networking Model (4 rules)

1. Every Pod gets its own IP.
2. All Pods can reach all Pods, **no NAT**.
3. Nodes can reach all Pods, no NAT.
4. A Pod's self-IP = the IP others see.

Implemented by a **CNI plugin**: Calico (NetworkPolicy, BGP), Cilium (eBPF, fast + observability), Flannel (simple overlay, no policy), AWS VPC CNI (real VPC IPs on EKS). **NetworkPolicy enforcement depends on the CNI** — Flannel ignores them.

### CNI Deep Comparison & Cloud IP Exhaustion (Interview Favorite)

| CNI | Data Path | Encapsulation | NetworkPolicy | Key Production Nuance |
| --- | --- | --- | --- | --- |
| **Flannel** | Linux bridge + VXLAN | Overlay (VXLAN UDP 8472) | ❌ None | Simple, no NetworkPolicy (unless paired with Calico as Canal) |
| **Calico** | `iptables` or eBPF | BGP direct routing (underlay) or VXLAN/IP-in-IP | ✅ Rich L3/L4 + GlobalNetworkPolicy | Enterprise workhorse; BGP avoids overlay encapsulation tax on-prem |
| **Cilium** | **eBPF** (socket & tc hooks) | Native routing or VXLAN/Geneve | ✅ L3/L4 + **L7 (HTTP/gRPC/DNS)** | Replaces `kube-proxy` entirely; Hubble flow UI; sidecarless Service Mesh |
| **AWS VPC CNI** | Secondary VPC IPs on ENIs | Underlay (native VPC routing) | ✅ (v1.14+ via eBPF) | **IP Exhaustion Trap**: nodes run out of ENI IPs (`max-pods = (ENIs × (IPs-per-ENI - 1)) + 2`) or exhaust subnet `/24` CIDRs → fix with **Prefix Delegation** (`/28` = 16 IPs per ENI slot) or secondary `100.64.0.0/10` CGNAT CIDRs |

---

## 2. Traffic Path (text sequence)

```text
Client → Service ClusterIP:port
       → kube-proxy rule (iptables O(n) | IPVS O(1))
       → Endpoint = ready Pod IP:targetPort

External: Client → LB/NodeIP:nodePort → ClusterIP → kube-proxy → Pod:targetPort
```

- Pod-to-pod: direct (same node = local bridge; cross-node = CNI overlay/routing).
- Pod-to-Service: DNAT at the node to a healthy endpoint — **endpoints only include ready Pods**.
- **`EndpointSlices` vs legacy `Endpoints`**: Historically, a Service had a single `Endpoints` object listing every pod IP. At 2,000+ pods, a single pod rollout rewrote a >1MB `Endpoints` object and broadcast it to all 500 nodes ("thundering herd"). **`EndpointSlices`** (default since v1.21) shard endpoints into chunks of **100 endpoints per slice**, so a pod restart updates only one small slice.
- `externalTrafficPolicy: Local` preserves client source IP and avoids an extra node hop, but causes imbalanced traffic if pods aren't evenly spread across nodes (and health checks fail on nodes with 0 local endpoints); `Cluster` (default) SNATs client IP and balances evenly across all pods cluster-wide.

### Concrete Packet Walkthrough Across Nodes (Qualys Pod Network Flow)

Suppose two Kubernetes worker nodes **`10.10.1.1`** and **`10.10.1.2`** (bound to `eth0`) host **`Pod-1 (10.240.0.1)`** and **`Pod-2 (10.240.0.2)`**:

- **How a Pod gets its IP (`Pause` container)**: Kubelet starts a lightweight **`pause` (sandbox) container** first for each Pod, which creates and holds the Pod's network namespace (`netns`), virtual ethernet pair (`veth`), and IP (`10.240.0.1`). All app/sidecar containers in the Pod join that `pause` container's `netns`. (Unlike Docker Swarm, which requires a separate CIDR per application network, Kubernetes allocates one cluster CIDR subdivided across nodes by the CNI).
- **Calico Container Bridge**: A Calico agent (`calico-node` DaemonSet) on each worker node manages the Linux kernel routing table, virtual container bridge/`veth` interfaces, and iptables/eBPF policies so node `10.10.1.1` knows how to route packets to `10.240.0.1` locally or across nodes to `10.240.0.2`.
- **Three Traffic Flows Step-by-Step**:
  1. **External Request via Ingress**: Client → HTTPS to `kubernetesLB` / `kubeingress` VIP (TLS offloaded at VIP) → forwarded over HTTP to an available kube-node (`10.10.1.1:80` Ingress Controller; across data centers this traverses NAT/DNAT) → Ingress resolves the backend Service via **CoreDNS** and selects an active Pod endpoint (`10.240.0.1`) → **iptables** (programmed by `kube-proxy`) + **Calico container bridge** deliver the packet to `Pod-1 (10.240.0.1)`.
  2. **External Request via NodePort**: `kube-proxy` opens the static NodePort (`30000–32767`) on **every** kube-node → request hits `10.10.1.1:<nodePort>` → iptables DNATs to a ready Pod endpoint (`10.240.0.1`) via the Calico container bridge.
  3. **Internal Pod-to-Pod Request**: `Pod-2` dials `<service>` → CoreDNS resolves the Service VIP → node iptables DNATs to `Pod-1 (10.240.0.1)` → if both pods sit on the **same node**, the packet routes directly across the local Calico container bridge (one less hop than cross-node).

### Qualys Pod Networking FAQs

- **Q: How does kube-node `10.10.1.1` know where `10.240.0.1` is, and which entities manage this mapping?**
  1. **Ingress Controller** maps the external host/path rule to the Kubernetes **Service** object.
  2. **Service** (via `EndpointSlices`) tracks healthy Pod IPs (`10.240.0.X`) and target container ports.
  3. **CoreDNS** resolves the Service name to its ClusterIP/endpoints.
  4. **Kube-Proxy** programs node `iptables`/IPVS rules mapping the Service to `10.240.0.1:<targetPort>`, and **Calico** routes the packet over the node's container bridge.
- **Q: When traffic comes through `kubernetesLB` → Nginx Ingress → application container, does the app see the client's originating IP?**
  By default the app sees the **`kubernetesLB` / Ingress proxy IP** as the source IP. To preserve and log the real client IP, configure the **`X-Forwarded-For`** header chain via `ingress-nginx` annotations (`use-forwarded-headers: "true"`).
- **Q: Why is traffic from `kubernetesLB`/`kubeingress` VIP to the Kubernetes nodes HTTP instead of HTTPS?**
  `kubernetesLB` / `kubeingress` VIP runs over HTTPS and performs **SSL/TLS offloading at the VIP edge**. Traffic from the VIP to the kube-nodes runs over HTTP because the kube-nodes reside inside a restricted Qualys POD network behind multiple firewall tiers, with MFA-enforced SSH and **zero public internet connectivity**.

---

## 3. The Port Model — port / targetPort / nodePort / containerPort (from source, interview favorite)

| Field | Lives on | Meaning | Gotcha |
| ------- | ---------- | --------- | -------- |
| `containerPort` | Pod spec | Documents the port the app listens on | **Informational** — traffic works without it; declare for clarity/tooling |
| `targetPort` | Service | Port on the Pod that receives forwarded traffic | Can be a **name** (`http`) → resilient to port renumbering |
| `port` | Service | Port the Service itself listens on (ClusterIP) | This is what in-cluster clients dial |
| `nodePort` | Service (NodePort type) | Static port opened on **every** node | Default range **30000–32767** (`--service-node-port-range`) |
| "externalPort" | — | Informal term: NodePort or the LB listener port | Not a real spec field — say it precisely in interviews |

**Example end-to-end**: container listens `:8080` → `targetPort: 8080` → Service `port: 80` → NodePort `31000` → cloud LB `:443`. Client hits `lb:443`, lands on pod `:8080`.

### Multi-port Service

```yaml
ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: https
    port: 443
    targetPort: 8443        # required: name each port when >1
```

### Port FAQ (from source)

- **Same port on many Pods?** Yes — each Pod has its own IP/netns; conflicts only matter **within** a Pod (two containers, one port) or on one node (hostPort).
- **containerPort omitted?** Works — Services route by targetPort anyway; it's documentation/policy input.
- **Port troubleshooting sequence**: `get svc` (ports right?) → `get endpoints` (any backends?) → `describe svc` (selector) → `exec` curl service from another pod → container actually listening (`ss -tlnp`).

---

## 4. ClusterIP vs NodePort vs LoadBalancer vs Ingress (X vs Y)

| | ClusterIP | NodePort | LoadBalancer | Ingress |
| --- | ----------- | ---------- | -------------- | --------- |
| Layer | 4, internal | 4, node edge | 4, cloud LB | **7** (HTTP host/path) |
| Reachable | Inside cluster | `NodeIP:30000–32767` | Single external IP/DNS | One LB → many services |
| TLS | — | — | Depends | Termination at controller |
| Cost | Free | Free | One cloud LB **per Service** | One LB for all routes |
| Use | Default svc-to-svc | Dev/quick expose | Simple prod expose | Prod HTTP, host/path fan-out |

**Money point**: N LoadBalancer Services = N cloud LBs; one Ingress = one LB routing to N Services — a real cost decision.

### Ingress manifest + controllers

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  tls: [{ hosts: [app.example.com], secretName: tls-secret }]
  rules:
    - host: app.example.com
      http:
        paths:
          - { path: /api, pathType: Prefix,
              backend: { service: { name: api, port: { number: 80 } } } }
          - { path: /,    pathType: Prefix,
              backend: { service: { name: web, port: { number: 80 } } } }
```

Controllers: **NGINX** (most common), **AWS ALB Controller** (native ALB), **Traefik**, plus **Gateway API** — the successor API with typed roles and richer traffic splitting (mention it as "Ingress v2").

### Ingress vs Gateway API

| | Ingress | Gateway API |
| --- | ------- | ----------- |
| Resources | One `Ingress` (all roles in one object) | `GatewayClass` → `Gateway` (infra) → `HTTPRoute`/`TCPRoute`/`GRPCRoute` (app) — role-separated |
| Traffic control | Annotations per controller (non-portable) | Native: weighted splits, header matching, retries, mirroring |
| Status | Basic | Rich status, cross-namespace refs via `ReferenceGrant` |
| Fit | Legacy + simple HTTP | New clusters, platform teams, canary-by-weight |

### Service extras worth knowing

- `sessionAffinity: ClientIP` — pins a client to one endpoint pod (in-node kube-proxy rule, not cookie-based; L7 stickiness needs Ingress/mesh).
- **Headless Service** (`clusterIP: None`) → DNS returns *all pod IPs*, StatefulSets get per-pod records `pod-0.svc.ns`: client-side LB + stable identity.
- `externalIPs` / `loadBalancerSourceRanges` — pin or restrict the LB source CIDRs.
- `internalTrafficPolicy: Local` — keep service traffic node-local.

---

## 5. CoreDNS & In-Cluster DNS (from source advanced Q)

- Pods get `/etc/resolv.conf` → cluster DNS IP (CoreDNS); search domains include `ns.svc.cluster.local` and **`ndots:5`** — so `my-svc` expands before being treated as external (that's why `my-svc` works but `example.com` does 5 lookups first).
- **The `ndots:5` Latency & Conntrack Tax**: Calling `api.stripe.com` (2 dots < 5) causes `libc` to try:
  1. `api.stripe.com.<ns>.svc.cluster.local` (NXDOMAIN)
  2. `api.stripe.com.svc.cluster.local` (NXDOMAIN)
  3. `api.stripe.com.cluster.local` (NXDOMAIN)
  4. `api.stripe.com.<cloud-domain>` (NXDOMAIN)
  5. Finally `api.stripe.com.` (A + AAAA = **8–10 UDP packets per external lookup!**)
- **Fixes for DNS latency/timeouts at scale**:
  1. Use a trailing dot for external FQDNs (`api.stripe.com.`) to bypass search path expansion immediately.
  2. Set `dnsConfig: { options: [{ name: ndots, value: "2" }] }` on pods that call external APIs heavily.
  3. Deploy **NodeLocal DNSCache** (DaemonSet listening on `169.254.20.10` on each node — caches DNS locally, upgrades upstream CoreDNS queries from UDP to TCP, eliminating Linux kernel `nf_conntrack` UDP race-condition packet drops).
- FQDN: `<svc>.<ns>.svc.cluster.local`; same-namespace short name is enough.
- **Resolution failing?** Debug sequence: `nslookup`/`dig` inside the pod → `kubectl -n kube-system logs -l k8s-app=kube-dns` → CoreDNS ConfigMap (`Corefile`) → CNI/network policy egress to `kube-dns:53` → node DNS config.
- **Service Mesh (Istio / Linkerd / Cilium)**: For L7 east-west mTLS, gRPC load balancing, circuit breaking, and traffic splitting (`VirtualService` / `DestinationRule`), see `../DevOps/06-nginx-haproxy-service-mesh.md`.

---

## 6. NetworkPolicy — Default-Open, Opt-In Firewall

All pod traffic is **allowed by default**; the first policy selecting a pod flips that pod to deny for the listed direction(s).

```yaml
# allow only frontend → api :8080
spec:
  podSelector: { matchLabels: { app: api } }
  policyTypes: [Ingress]
  ingress:
    - from: [{ podSelector: { matchLabels: { app: frontend } } }]
      ports: [{ port: 8080 }]

# deny-all baseline (then add allow-lists)
spec:
  podSelector: {}
  policyTypes: [Ingress, Egress]
```

Selectors: `podSelector`, `namespaceSelector`, `ipBlock` (CIDR, e.g. external APIs). Remember egress policies can accidentally block **DNS (udp/53 to kube-system)** — allow it explicitly.

---

## 7. Networking Troubleshooting Sequence

```text
1. svc exists + right ports        → kubectl get/describe svc
2. endpoints populated?            → kubectl get endpoints <svc>   (empty → selector/labels/readiness)
3. pod-to-pod direct works?        → kubectl exec -- curl <podIP>:<port>
4. service DNS resolves?           → kubectl exec -- nslookup <svc>
5. policy blocking?                → kubectl get networkpolicy
6. node/kube-proxy layer           → kube-proxy logs, iptables -t nat -L (node access)
```

---

## 8. Recall — Sound Bites

- "Service is a name, endpoints are the truth."
- "port = Service's ear, targetPort = Pod's ear, nodePort = every node's ear."
- "ClusterIP inside, NodePort on nodes, LoadBalancer outside, Ingress = one LB for HTTP."
- "NetworkPolicy is opt-in deny; no policy = everything open."
- "DNS broke? resolv.conf → CoreDNS logs → NetworkPolicy on 53."
- "Ask which kube-proxy mode at scale: iptables O(n) vs IPVS O(1)."
