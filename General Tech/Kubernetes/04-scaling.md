# Kubernetes Scaling

## Scaling Dimensions
```
Horizontal Pod Autoscaler (HPA) — Scale pods in/out
Vertical Pod Autoscaler (VPA)   — Resize pod resources up/down
Cluster Autoscaler / Karpenter  — Scale nodes in/out
```

## HPA (Horizontal Pod Autoscaler)
Automatically scales pod replicas based on metrics.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70     # scale when CPU > 70%
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

```bash
kubectl autoscale deployment myapp --cpu-percent=70 --min=2 --max=20
kubectl get hpa
```

**Requirements:** Pods MUST have `resources.requests` set for CPU/memory. Metrics Server must be installed.

## VPA (Vertical Pod Autoscaler)
Adjusts pod CPU/memory requests automatically. **Restarts pods** to apply changes.

Best for: workloads where you don't know correct resource requests. **Don't use HPA and VPA together on the same metric.**

## Cluster Autoscaler
Adds/removes nodes when:
- Pods are **pending** due to insufficient resources → add node
- Nodes are **underutilized** for extended period → remove node

## Karpenter (AWS — next-gen autoscaler)
- Faster than Cluster Autoscaler (provisions in seconds, not minutes)
- Chooses right instance type based on pod requirements
- Supports spot instances, consolidation

## PodDisruptionBudget (PDB)
Ensures minimum availability during voluntary disruptions (node drain, upgrades).

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: myapp-pdb
spec:
  minAvailable: 2          # always keep at least 2 pods running
  # OR: maxUnavailable: 1  # at most 1 pod can be down
  selector:
    matchLabels:
      app: myapp
```

## Interview Questions

**Q: How does HPA decide to scale?**
It checks metrics every 15s (default). Calculates: `desiredReplicas = ceil(currentReplicas × (currentMetricValue / targetMetricValue))`. Has a cooldown period to avoid flapping.

**Q: Pod is pending with "Insufficient cpu". What do you do?**
1. Check if nodes have capacity: `kubectl describe nodes | grep -A5 "Allocated"`
2. If full: Cluster Autoscaler should add nodes. Check CA logs if it's not.
3. If not scaling: Check node group max size, resource quotas, pod resource requests
