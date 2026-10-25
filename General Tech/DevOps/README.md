# DevOps Interview Preparation — Complete Notes

## Topics

| # | Topic | Doc |
| --- | ------- | ----- |
| 1 | [Linux & Networking Fundamentals](./01-linux-networking.md) | Commands, kernel/process states, inodes/FDs, TCP/IP, DNS, HTTP/1.1–3, mTLS |
| 2 | [Git & Version Control](./02-git.md) | Branching, merge/squash/rebase, reflog/bisect, monorepo Git |
| 3 | [Docker & Containers](./03-docker.md) | Namespaces/cgroups, PID 1 & tini, alpine vs glibc/distroless, multi-stage, networking |
| 4 | [CI/CD, Jenkins, GitOps & Production Deployment](./04-cicd.md) | Jenkins architecture/shared libs, ArgoCD vs Qualys `qhelm`/`quadfile`, deployment strategies |
| 5 | [Configuration Management (Ansible, Chef, Puppet)](./05-config-management-ansible-chef-puppet.md) | Ansible architecture/playbooks, Chef/Puppet pull vs push, Qualys Consul/Vault/`qhelm` orchestration |
| 6 | [Nginx, HAProxy, Envoy & Service Mesh](./06-nginx-haproxy-service-mesh.md) | L4 vs L7 proxies, Nginx/HAProxy tuning & traps, Istio/Linkerd/Cilium, real-world 502/503 case studies |
| 7 | [Monitoring & Observability](./07-monitoring.md) | Prometheus metric types (Histogram vs Summary), multi-window burn-rate alerts, OpenTelemetry, ELK/Loki |
| 8 | [DevOps Security](./08-security.md) | SAST/SCA/DAST, HashiCorp Vault (AppRole/K8s auth), OIDC, supply chain (SLSA/cosign) |
| 9 | [DevOps Interview Q&A](./09-interview-qa.md) | Rapid-fire questions & production troubleshooting scenarios |

## Deep Dives

| Doc | Focus |
| --- | --- |
| [Production CI/CD, GitOps & Helm](./Production-CI-CD-and-GitOps-Deep-Dive.md) | Full staff-level pipeline narrative, phase-by-phase |
| [Enterprise Microservice Deployment Recipe](./Enterprise-Microservice-Deployment-Recipe.md) | Three-repo enterprise rollout recipe (Qualys-style pattern) |
| [DevOps Case Studies & Scenario Questions](./DevOps-Case-Studies-and-Scenario-Questions.md) | Staff-level CI/CD, IaC, observability, security, reliability, migration, and culture cases |

> Terraform and AWS notes live in their own folders: `../Terraform`, `../AWS`.
