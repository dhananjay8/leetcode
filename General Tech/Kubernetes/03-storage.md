# Kubernetes Storage — Interview Notes

## 1. Model (text sequence)

```text
StorageClass (provisioner + params + reclaimPolicy)
   → PersistentVolumeClaim (pod's request for storage)
      → PersistentVolume (actual storage, dynamically provisioned)
         → Pod mounts the PVC at a path
```

- **PV** = cluster-level storage resource · **PVC** = a pod's *claim* for storage (size + access mode + class).
- **Static**: admin pre-creates PVs → PVC binds to matching one. **Dynamic** (the norm): PVC names a `storageClassName` → CSI driver creates the PV + cloud disk on demand.
- `volumeBindingMode: WaitForFirstConsumer` — don't provision until the pod is **scheduled**, so the disk lands in the right AZ (critical: EBS is AZ-locked).

---

## 2. Volume Types — Ephemeral vs Persistent

| | Ephemeral | Persistent |
| --- | ----------- | ------------ |
| Examples | `emptyDir`, ConfigMap/Secret/downwardAPI volumes, container fs | `persistentVolumeClaim` (EBS, EFS, NFS, Ceph) |
| Survives pod deletion | **No** — dies with pod (emptyDir survives container *restart* on same pod) | **Yes** — independent lifecycle |
| Use | Scratch, cache, shared pod-local data | Databases, queues, anything precious |

> Note (advanced, from source): pods using `emptyDir`/`hostPath`/local PV **block Cluster Autoscaler** from draining that node — autoscaler won't evict them without `--skip-pods-with-local-storage` or PDB workarounds. Prefer real PVCs.

---

## 3. Access Modes & Reclaim Policies

| Mode | Meaning | Typical |
| ------ | --------- | --------- |
| **RWO** | One node read-write | EBS (block) — the default answer |
| **ROX** | Many nodes read-only | Shared data/artifacts |
| **RWX** | Many nodes read-write | EFS/NFS/filestore — shared filesystems |
| **RWOP** | Single pod read-write (v1.22+) | Strongest guarantee for stateful apps |

| Reclaim policy | On PVC delete |
| ---------------- | --------------- |
| `Delete` (dynamic default) | PV + backing cloud disk deleted — **data gone** |
| `Retain` | PV kept in Released state → manual cleanup/reclaim |
| `Recycle` | Deprecated — don't use |

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata: { name: gp3 }
provisioner: ebs.csi.aws.com          # CSI driver = out-of-tree plugin
parameters: { type: gp3, fsType: ext4 }
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```

---

## 4. StatefulSet Storage Pattern

```yaml
spec:
  serviceName: postgres              # headless svc → stable DNS: pod-0.postgres
  replicas: 3
  template:
    spec:
      containers: [{ name: pg, image: postgres:16,
                     volumeMounts: [{ name: data, mountPath: /var/lib/postgresql/data }] }]
  volumeClaimTemplates:              # THE key field: one PVC per pod, named data-postgres-N
    - metadata: { name: data }
      spec:
        accessModes: [ReadWriteOnce]
        storageClassName: gp3
        resources: { requests: { storage: 20Gi } }
```

Deleting pod-2 → new pod-2 mounts the **same** PVC. Deleting the StatefulSet does **not** delete the PVCs (by design; manual cleanup).

---

### CSI, VolumeSnapshots & Static Provisioning

- **CSI (Container Storage Interface)**: out-of-tree driver standard — `ebs.csi.aws.com`, `efs.csi.aws.com`, `pd.csi.storage.gke.io`. Replaced in-tree cloud provisioners (which is why old manifests mentioning `kubernetes.io/aws-ebs` now fail).
- **VolumeSnapshot**: point-in-time copy via `VolumeSnapshotClass` → restore by creating a PVC with `dataSource` pointing at the snapshot. Snapshot ≠ backup until it's off-cluster/durable.
- **Static provisioning**: admin creates PV manually → PVC binds on matching size/mode/class. Used for pre-existing data (migrations, shared legacy volumes).
- **Generic ephemeral volumes** (v1.23+): `ephemeral.volumeClaimTemplate` — a PVC scoped to the pod's lifetime (dies with it); useful for scratch that needs a real provisioner.

## 5. Interview Q&A

**Q: Deployment vs StatefulSet (storage angle)?**
Deployment pods share/interchangeable storage. StatefulSet = `volumeClaimTemplates` gives pod-N a dedicated, sticky PVC + stable network identity + ordered ops.

**Q: PVC deleted — what happens to data?**
`reclaimPolicy`: `Delete` destroys backing storage; `Retain` keeps it for manual reclaim. Choose Retain for prod data classes + snapshots as backup.

**Q: Resize a volume?**
Edit PVC `requests.storage` upward (requires StorageClass `allowVolumeExpansion: true` + CSI support). **Downsize is not supported.**

**Q: Backups?**
Velero (cluster objects + volume snapshots), CSI `VolumeSnapshot`, or app-level dumps (`pg_dump` → S3). Snapshots ≠ backup until copied off-cluster.

**Q: emptyDir vs PVC?**
emptyDir = scratch, dies with the pod. PVC = durable, survives pod/node replacement.

**Q: Pod pending on "waiting for volume"?**
Sequence: `describe pvc` (Bound? Pending?) → StorageClass provisioner healthy? → CSI controller logs → node/AZ topology mismatch (`WaitForFirstConsumer` helps).

---

## 6. Recall — Sound Bites

- "PVC is the *request*, PV is the *resource*, StorageClass is the *factory*."
- "RWO = one node (EBS); RWX = shared FS (EFS/NFS)."
- "`volumeClaimTemplates` is the StatefulSet superpower."
- "Local storage on a pod = autoscaler can't evict the node."
- "WaitForFirstConsumer = disk is born in the right AZ."
