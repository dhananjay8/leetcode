# Kubernetes Storage

## Storage Hierarchy
```
StorageClass (defines provisioner + parameters)
    ↓
PersistentVolume (PV) — actual storage resource
    ↓
PersistentVolumeClaim (PVC) — request for storage by a pod
    ↓
Pod (mounts the PVC)
```

## PersistentVolume & PersistentVolumeClaim

```yaml
# PVC — request storage (dynamic provisioning: PV auto-created)
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
spec:
  accessModes:
    - ReadWriteOnce         # RWO: single node read-write
  storageClassName: gp3     # matches StorageClass
  resources:
    requests:
      storage: 10Gi

---
# Pod using PVC
spec:
  containers:
    - name: app
      volumeMounts:
        - mountPath: /data
          name: storage
  volumes:
    - name: storage
      persistentVolumeClaim:
        claimName: app-data
```

### Access Modes
| Mode | Abbr | Description |
|------|------|-------------|
| ReadWriteOnce | RWO | Single node read-write (most common, EBS) |
| ReadOnlyMany | ROX | Multiple nodes read-only |
| ReadWriteMany | RWX | Multiple nodes read-write (EFS, NFS) |

### Reclaim Policies
| Policy | Behavior |
|--------|----------|
| **Retain** | PV kept after PVC deleted (manual cleanup) |
| **Delete** | PV and underlying storage deleted with PVC |

## StorageClass (Dynamic Provisioning)
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
provisioner: ebs.csi.aws.com   # CSI driver
parameters:
  type: gp3
  fsType: ext4
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer  # bind when pod is scheduled
```

## StatefulSet
For stateful workloads (databases, message queues) that need:
- **Stable network identity**: `pod-0`, `pod-1`, `pod-2` (not random names)
- **Stable storage**: Each pod gets its own PVC that persists across restarts
- **Ordered deployment**: Pods created/deleted in order (0→1→2, deleted 2→1→0)

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres   # headless service for DNS
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:     # each pod gets its own PVC
    - metadata:
        name: data
      spec:
        accessModes: [ReadWriteOnce]
        storageClassName: gp3
        resources:
          requests:
            storage: 20Gi
```

## Interview Questions

**Q: Deployment vs StatefulSet?**
- **Deployment**: Stateless apps, interchangeable pods, shared storage OK
- **StatefulSet**: Stateful apps, stable identity (pod-0), each pod has own PVC, ordered operations

**Q: What happens when a PVC is deleted?**
Depends on `reclaimPolicy`: Retain keeps the PV for manual cleanup; Delete removes PV and cloud storage. Data can be lost with Delete policy.

**Q: How do you back up data in Kubernetes?**
- **Velero**: Backs up K8s resources + PV snapshots
- **CSI snapshots**: Cloud-native volume snapshots (VolumeSnapshot resource)
- **Application-level**: pg_dump, mongodump into S3
