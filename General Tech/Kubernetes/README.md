# Kubernetes Interview Preparation — Complete Notes

## Topics

| # | Topic | Doc |
| --- | ------- | ----- |
| 1 | [Core Concepts (Pods, Deployments, Services)](./01-core-concepts.md) | Architecture, Pods, QoS, probes, controllers, ConfigMap/Secret propagation |
| 2 | [Networking (CNI, Ingress, Gateway API, DNS)](./02-networking.md) | CNI & AWS VPC IP exhaustion, EndpointSlices, port model, CoreDNS `ndots:5` & NodeLocal DNSCache |
| 3 | [Storage (PV, PVC, CSI, StatefulSets)](./03-storage.md) | CSI, VolumeSnapshots, `WaitForFirstConsumer`, StatefulSet `volumeClaimTemplates` |
| 4 | [Scaling (HPA, VPA, KEDA, Karpenter)](./04-scaling.md) | HPA, KEDA (`0↔1↔N`), in-place VPA resize, Cluster Autoscaler vs Karpenter, PDBs |
| 5 | [Security (RBAC, Bound Tokens, PSS, CEL)](./05-security.md) | RBAC, `TokenRequest` bound JWTs, PSS, CEL `ValidatingAdmissionPolicy`, gVisor/Falco |
| 6 | [Helm 3 & Kustomize](./06-helm-kustomize.md) | Helm 3 internals (release Secrets, 3-way merge, hooks), Kustomize overlays, Qualys `qhelm` |
| 7 | [GitOps & ArgoCD](./07-gitops-argocd.md) | ArgoCD architecture, Sync Waves/Hooks, ApplicationSet, Flux, Qualys `quadfile`/`qhelm` bridge |
| 8 | [Observability (Prometheus, Loki, OTel, eBPF)](./08-observability.md) | RED/USE signals, kube-state-metrics, Fluent Bit, eBPF Hubble/Tetragon |
| 9 | [Troubleshooting & Production Case Studies](./09-troubleshooting.md) | 9-step sequence, `nsenter` node forensics, rolling-update 502 race, conntrack DNS, JVM OOM, webhook deadlock |
| 10 | [Interview Q&A — Top 50+](./10-interview-qa.md) | Rapid-fire fundamental, scaling, security, and staff incident scenarios |
| 11 | [Advanced Concepts (Kube-Astronaut Depth)](./11-advanced-concepts.md) | `client-go` Informers/Workqueues, etcd MVCC/defrag, APF, Lease heartbeats, FinOps |
