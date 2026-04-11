# Kubernetes Troubleshooting Guide

## Debug Flowchart
```
Pod not running?
├── Pending → Check: resources, node selector, taints, PVC binding
├── CrashLoopBackOff → Check: logs, readiness/liveness probes, exit code
├── ImagePullBackOff → Check: image name, registry auth, image exists
├── ErrImagePull → Check: imagePullSecrets, network to registry
└── OOMKilled → Increase memory limits
```

## Essential Commands

### Pod Debugging
```bash
kubectl get pods -o wide                          # pod status + node
kubectl describe pod <pod>                        # events, conditions, details
kubectl logs <pod>                                # container logs
kubectl logs <pod> -c <container>                 # specific container logs
kubectl logs <pod> --previous                     # logs from crashed container
kubectl exec -it <pod> -- sh                      # shell into pod
kubectl exec -it <pod> -- curl localhost:8080     # test from inside pod
kubectl top pods                                  # CPU/memory usage
kubectl get events --sort-by=.lastTimestamp       # recent events
```

### Node Debugging
```bash
kubectl get nodes                                 # node status
kubectl describe node <node>                      # conditions, capacity, allocated
kubectl top nodes                                 # node resource usage
kubectl cordon <node>                             # mark unschedulable
kubectl drain <node> --ignore-daemonsets          # evict pods, prepare for maintenance
kubectl uncordon <node>                           # make schedulable again
```

### Service & Networking
```bash
kubectl get svc                                   # list services
kubectl describe svc <svc>                        # check endpoints
kubectl get endpoints <svc>                       # are pods registered?
kubectl exec -it <pod> -- nslookup <svc>          # test DNS
kubectl exec -it <pod> -- curl <svc>:<port>       # test connectivity
kubectl port-forward svc/<svc> 8080:80            # access service locally
```

---

## Common Issues & Solutions

### 1. Pod Stuck in Pending
```bash
kubectl describe pod <pod>   # look at Events section
```
| Cause | Fix |
|-------|-----|
| Insufficient CPU/memory | Add nodes, reduce requests, check resource quotas |
| No matching nodes (nodeSelector/affinity) | Fix selector or label nodes |
| PVC not bound | Check StorageClass, PV availability |
| Taint on all nodes | Add toleration to pod spec |

### 2. CrashLoopBackOff
```bash
kubectl logs <pod> --previous   # see why it crashed
kubectl describe pod <pod>      # check exit code
```
| Cause | Fix |
|-------|-----|
| App error (exit code 1) | Fix application bug, check config |
| OOMKilled (exit code 137) | Increase memory limits |
| Missing config/secret | Ensure ConfigMap/Secret exists |
| Failing liveness probe | Fix health endpoint or increase initialDelaySeconds |

### 3. ImagePullBackOff
| Cause | Fix |
|-------|-----|
| Wrong image name/tag | Verify image exists in registry |
| Private registry, no auth | Create imagePullSecret, reference in pod spec |
| Network issue | Check node can reach registry |

### 4. Service Has No Endpoints
```bash
kubectl get endpoints <svc>       # empty = no matching pods
kubectl get pods --show-labels    # check pod labels
kubectl describe svc <svc>       # check selector
```
Fix: Ensure service selector matches pod labels exactly.

### 5. Pod Can't Reach Another Service
```bash
kubectl exec -it <pod> -- nslookup <service-name>    # DNS working?
kubectl exec -it <pod> -- curl <service-name>:<port>  # connectivity?
kubectl get networkpolicies                            # any policies blocking?
```

### 6. High Memory / OOMKilled
```bash
kubectl top pods --sort-by=memory
kubectl describe pod <pod> | grep -A3 "Last State"    # check for OOMKilled
```
Fix: Increase `resources.limits.memory` or fix memory leak in application.

---

## Quick Reference: Exit Codes
| Code | Meaning |
|------|---------|
| 0 | Success (container completed normally) |
| 1 | Application error |
| 126 | Command cannot execute (permission issue) |
| 127 | Command not found |
| 137 | SIGKILL (OOMKilled or `kill -9`) |
| 143 | SIGTERM (graceful shutdown) |
