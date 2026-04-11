# Kubernetes Networking

## Networking Model — Key Rules
1. Every pod gets its own IP address
2. Pods can communicate with all other pods without NAT
3. Nodes can communicate with all pods without NAT
4. A pod sees itself with the same IP that others see it

## CNI (Container Network Interface)
Plugin that sets up networking for pods. Popular CNIs:
- **Calico**: Most popular, supports NetworkPolicies, BGP
- **Cilium**: eBPF-based, fast, advanced observability
- **Flannel**: Simple overlay network (good for learning)
- **AWS VPC CNI**: Pods get real VPC IPs (EKS default)

## Service Networking

### How a Service Routes Traffic
```
Client → Service (ClusterIP: 10.96.0.1:80)
              ↓ (kube-proxy / iptables / IPVS)
         Endpoint 1 (Pod IP: 10.244.1.5:8080)
         Endpoint 2 (Pod IP: 10.244.2.3:8080)
         Endpoint 3 (Pod IP: 10.244.3.7:8080)
```
kube-proxy maintains iptables rules that round-robin traffic to healthy pod IPs.

## Ingress
Layer 7 (HTTP) routing. Maps external URLs to internal services.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  tls:
    - hosts: [myapp.example.com]
      secretName: tls-secret
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
```

### Ingress Controllers
| Controller | Notes |
|-----------|-------|
| **NGINX Ingress** | Most popular, feature-rich, community-maintained |
| **AWS ALB Ingress** | Native AWS ALB integration for EKS |
| **Traefik** | Auto-discovery, Let's Encrypt built-in |
| **Gateway API** | Next-gen replacement for Ingress (K8s native) |

## CoreDNS
Built-in DNS server for K8s cluster.

```
Service DNS:     <service>.<namespace>.svc.cluster.local
Pod DNS:         <pod-ip-dashed>.<namespace>.pod.cluster.local

Example:
  myapp-service.default.svc.cluster.local
  Within same namespace, just use: myapp-service
```

## NetworkPolicy
Firewall rules for pod-to-pod traffic. **By default, all traffic is allowed.** NetworkPolicy restricts it.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-api
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: api           # apply to API pods
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend   # only allow traffic from frontend pods
      ports:
        - port: 8080
```

**Default deny all ingress:**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}       # apply to all pods
  policyTypes:
    - Ingress
  # no ingress rules = deny all
```

## Troubleshooting Networking
```bash
kubectl exec -it <pod> -- curl http://service-name:port   # test service connectivity
kubectl exec -it <pod> -- nslookup service-name           # test DNS
kubectl get endpoints <service>                            # check service has endpoints
kubectl describe svc <service>                             # check selector matches pods
kubectl get networkpolicies                                # check if policies blocking traffic
kubectl logs -n kube-system -l k8s-app=kube-dns           # check CoreDNS logs
```
