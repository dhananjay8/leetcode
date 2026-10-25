# Configuration Management — Ansible, Chef, Puppet & Qualys Orchestration

## 1. Configuration Management vs IaC Provisioning (X vs Y)

| Dimension | Terraform (IaC Provisioning) | Ansible | Puppet | Chef | SaltStack |
| --- | --- | --- | --- | --- | --- |
| **Primary role** | Provision cloud/infra resources (VPC, EKS, RDS) | Config mgmt, app deployment, procedural orchestration | Fleet OS/state enforcement | Code-driven OS/app config | High-speed event-driven config & remote exec |
| **Architecture** | Client CLI → Cloud API | **Agentless** (Control node → SSH / WinRM / API) | **Agent-based** (`puppet agent` → Puppet Primary) | **Agent-based** (`chef-client` → Chef Infra Server) | **Agent (Minion → Master)** or Agentless (`salt-ssh`) |
| **Model** | **Push**, declarative (HCL) | **Push** (default) or `ansible-pull`; YAML playbooks | **Pull** (every 30m default); declarative DSL | **Pull**; Ruby DSL (procedural recipes) | **Push + Pull** (ZeroMQ event bus); YAML |
| **State tracking** | Explicit `terraform.tfstate` | **Stateless** — queries target facts on every run | Catalog compiled on master, state report on run | Node object stored on Chef Server | Mine / Pillar / Grain state in master |
| **Idempotency** | Diff desired HCL vs state/cloud | Modules check current state before acting | Resource catalog convergence | `not_if` / `only_if` guards + resource providers | State modules check before change |
| **Best fit** | Cloud infrastructure lifecycle | Multi-tier rollouts, K8s/Helm orchestration (`qhelm`), ad-hoc ops | Strict compliance / drift remediation on 10k+ Linux/Windows VMs | Ruby-heavy infra teams, complex custom OS logic | Ultra-fast parallel execution across thousands of nodes |

**Staff Rule of Thumb**: **Terraform builds the house** (VPC, subnets, EKS nodes, IAM); **Ansible/Puppet configures the rooms or orchestrates releases** (OS hardening, daemon config, or driving `quadfile`/`qhelm`/Consul/Vault release pipelines); **Kubernetes/GitOps runs the tenants** (containers). Better yet: bake immutable golden images (**Packer** + Ansible) so runtime config drift cannot happen.

---

## 2. Ansible — Architecture & Core Concepts

```text
Control Node (Ansible CLI / AWX / Tower / Jenkins Runner)
  ├── Inventory (static INI/YAML or dynamic AWS/Consul/K8s plugin)
  ├── Playbook (ordered Plays mapping host groups → Roles/Tasks)
  ├── Variable Precedence (22 levels: role defaults → group_vars → host_vars → --extra-vars)
  └── Connects via SSH (Linux) / WinRM (Windows) / localhost (K8s/Helm/Cloud APIs)
        └── Pushes Python module → executes idempotently → returns JSON {changed: true/false, failed: false}
```

### Core Building Blocks

| Concept | Purpose | Interview Nuance |
| --- | --- | --- |
| **Inventory** | Targets grouped by env/role (`[web]`, `[db]`) | Production uses **Dynamic Inventory** (queries AWS EC2 tags, Consul, or K8s API at runtime) |
| **Facts (`setup` module)** | Auto-collected target metadata (`ansible_os_family`, IPs, CPU, mounts) | Disable `gather_facts: false` when running API/Helm tasks on `localhost` to speed up playbooks 5× |
| **Task & Module** | Single unit of work (`apt`, `copy`, `template`, `systemd`, `kubernetes.core.helm`) | **Idempotent** modules (`copy`, `template`, `user`) safe to re-run; **`command`/`shell`/`raw` are NOT idempotent** unless guarded with `creates:`, `changed_when:`, `failed_when:` |
| **Handler** | Triggered via `notify:` only when a task reports `changed: true` | Runs **once at the end of the play** even if notified by 5 tasks (use `meta: flush_handlers` to force immediate execution mid-play) |
| **Role** | Standardized directory layout (`tasks/`, `handlers/`, `templates/`, `files/`, `vars/`, `defaults/`, `meta/`) | Reusable unit shared via Ansible Galaxy or internal config repos |
| **Templates (Jinja2)** | `.j2` files rendered with variables/facts (`{{ http_port }}`) | Renders on the control node before shipping to target; triggers handler on diff |
| **Ansible Vault** | Encrypts sensitive vars/files (`ansible-vault encrypt_string`, AES-256) | In enterprise pipelines, prefer fetching live secrets via **HashiCorp Vault lookup plugin** at runtime |

### Variable Precedence (simplified — lowest to highest)

```text
1. role defaults (defaults/main.yml)         — lowest, meant to be overridden
2. inventory group_vars/all → group_vars/<group> → host_vars/<host>
3. playbook vars / vars_files
4. role vars (vars/main.yml)
5. task vars / set_fact / registered vars
6. -e / --extra-vars                         — ALWAYS WINS (highest precedence)
```

### Production Playbook Pattern (Rolling Update with Load Balancer Drain)

```yaml
- name: Rolling update web tier with zero downtime
  hosts: webservers
  serial: "25%"                 # batch size: 25% of fleet at a time
  max_fail_percentage: 10       # abort entire rollout if >10% fail
  become: true
  pre_tasks:
    - name: Drain node from HAProxy before touching app
      community.general.haproxy:
        state: disabled
        backend: web_back
        host: "{{ inventory_hostname }}"
      delegate_to: "{{ item }}"
      loop: "{{ groups['lb'] }}"
  roles:
    - role: app_deploy
  post_tasks:
    - name: Verify local health endpoint before re-enabling traffic
      ansible.builtin.uri:
        url: "http://127.0.0.1:8080/healthz"
        status_code: 200
      retries: 10
      delay: 3
    - name: Re-enable node in HAProxy
      community.general.haproxy:
        state: enabled
        backend: web_back
        host: "{{ inventory_hostname }}"
      delegate_to: "{{ item }}"
      loop: "{{ groups['lb'] }}"
```

---

## 3. How Ansible, Consul, Vault & Helm Work Together in Enterprise / Qualys Pods

In Qualys-style multi-pod Kubernetes environments (`etm-audit-<service>` → `etm-audit-config-mgmt` → `etmaudit`), Ansible is used not just for VMs, but as the **release orchestration layer** that wires Consul KV, Vault policies (`qvaultsi`), and Helm (`qhelm` + `quadfile.yaml`) per pod:

```text
1. Service Repo (etm-audit-<service>)
   └── Packages config/consul/ + config/helm/ zips via config-release-maven-plugin
2. Central Config Repo (etm-audit-config-mgmt)
   ├── Aggregates service zips into versioned {consul, helm, ansible} artifacts
   └── Holds base cross-pod defaults: config/ansible/overrides/qhelm/<svc>-values-override.yml
         (uses @etm-audit-<service>.version@ token replaced at build time)
3. Pod Environment Repo (etmaudit/environment/<podKind>/<podName>/)
   ├── ansible/overrides/quadfile.yaml              # ordered list of central-helm releases + wait_for_success + timeout
   ├── ansible/overrides/qhelm/common-values-override.yml   # pod-wide Consul, Vault, Kafka, Proxy, Oracle, S3 URLs
   ├── ansible/overrides/qhelm/<svc>-values-override.yml    # pod-specific overrides (ingress regex, VAULT_PATHS, JAVA_OPTS)
   ├── ansible/overrides/qvaultsi/<svc>/etmaudit.hcl        # Vault HCL read policies for secret/etm-audit/<svc>
   └── consul/<svc>/{application.yaml, kafka-client.yaml}   # pod-specific Consul KV overrides
4. Controlled CD Runner (Ansible / Jenkins)
   ├── Syncs Consul KV hierarchy (base config + pod override → etmaudit/apps/<svc>)
   ├── Applies qvaultsi HCL policies to HashiCorp Vault (AppRole auth)
   └── Iterates quadfile.yaml in order → runs qhelm (Helm upgrade --install) with layered values
```

**Why this pattern matters in interviews**:

- It solves **multi-pod / multi-region configuration sprawl**: 90% of a service's Helm spec is identical across `dev (p19)`, `qa (p43)`, and `prod` pods (lives in `etm-audit-config-mgmt` base override); only the 10% pod-specific delta lives in `etmaudit`.
- **`quadfile.yaml` enforces DAG ordering**: foundational services (`library-sync-service` with `wait_for_success: true`) finish rolling out and passing readiness probes before dependent UI/consumer services start.

---

## 4. Puppet & Chef — What You Must Know for Interviews

Even in K8s-heavy shops, interviewers ask how legacy/hybrid VM fleets are managed or how you migrate off Chef/Puppet.

| Concept | Puppet | Chef | Ansible Equivalent |
| --- | --- | --- | --- |
| **Config unit** | **Manifest** (`.pp`, declarative Ruby-like DSL) | **Recipe** (`.rb`, procedural Ruby DSL) | **Playbook / Task** (`.yml`) |
| **Bundle / Module** | **Module** (`manifests/`, `templates/`, `files/`) | **Cookbook** (`recipes/`, `attributes/`, `templates/`) | **Role** |
| **Host facts** | **Facter** (collects OS/hardware facts before catalog request) | **Ohai** (collects node attributes at start of `chef-client` run) | **`setup` module** (`gather_facts`) |
| **External data** | **Hiera** (hierarchical key/value lookup separated from code) | **Data Bags** (encrypted/plain JSON) + **Attributes** | `group_vars` / `host_vars` / Ansible Vault |
| **Execution flow** | Agent sends Facter facts → Master compiles **Catalog** (DAG of resources) → Agent enforces catalog every 30m | Agent pulls Cookbook → compiles resource collection → converges node in recipe order | Control node SSHs in and runs tasks top-to-bottom |
| **Templates** | ERB / EPP (`.erb` / `.epp`) | ERB (`.erb`) | Jinja2 (`.j2`) |

### Key Interview Trade-Offs (Push vs Pull at Scale)

- **Why Pull (Puppet/Chef) wins on 20,000 VMs**: No central SSH bottleneck; nodes check in on a splayed schedule (every 30m + random jitter) and **self-heal configuration drift automatically** without a human triggering a pipeline.
- **Why Push (Ansible) wins for deployments & orchestration**: Zero agent to install/patch/cert-rotate on targets; deterministic **multi-node ordering** (e.g., "drain LB → migrate DB → rolling-restart app → smoke test" is trivial in Ansible `serial:` playbooks, whereas pull agents converge independently and asynchronously).
- **Modern synthesis**: Use **ArgoCD/Flux** for pull-based drift self-healing on Kubernetes, **Packer + Ansible** to bake immutable VM AMIs at build time, and **Ansible** for orchestrated zero-downtime maintenance playbooks.

---

## 5. Interview Scenarios & Case Studies

**Q: Playbook works in staging, hangs or takes 45 minutes on 500 prod servers. How do you speed up Ansible?**

1. Enable **SSH Pipelining** (`pipelining = True` in `ansible.cfg`) — executes modules over one persistent SSH session instead of copying files via SFTP per task (cuts SSH round-trips by 60%).
2. Enable **ControlMaster / ControlPersist** SSH multiplexing.
3. Increase **`forks`** (default is only `5` parallel hosts! Raise to `50–100`).
4. Set `gather_facts: false` or use **Fact Caching** (Redis/JSON) so facts aren't re-collected on every play.
5. Use **`strategy: free`** (when hosts don't need lockstep synchronization) or **`async:` + `poll:`** for long-running tasks.
6. Replace slow loops (`loop:` over `apt`/`yum` installs package-by-package) with passing a list directly to `name: [pkg1, pkg2]`.

**Q: A `shell:` task in an Ansible playbook restarts a database every single run even when nothing changed. How do you make it idempotent?**

1. First, replace `shell:` with the native module (`ansible.builtin.systemd` or `service`) and trigger restarts only via a **`notify:` handler** when the config `template:` task actually changes.
2. If a CLI command has no native module, add **`creates: /path/to/marker`**, or run a read-only check first (`register: check_out`, `changed_when: false`) and guard the mutation task with `when: check_out.stdout != desired`.

**Q: How do you test Ansible roles and Chef/Puppet code in CI before touching production?**

1. `ansible-lint` + `yamllint` (static analysis).
2. **`--check` (dry-run) + `--diff`** against staging inventory to preview exact file diffs without mutating state.
3. **Molecule** (spins up ephemeral Docker/Podman containers or Vagrant VMs, runs the role,runs **Idempotence test** by executing the playbook a *second* time and asserting `changed=0`, then verifies state with **Testinfra**/**Goss**).

---

## 6. Recall — Sound Bites

- "Terraform provisions the cloud; Ansible configures the OS or orchestrates the release; K8s runs the workload."
- "Ansible is agentless push over SSH; Puppet/Chef are agent-based pull with 30-minute drift convergence."
- "`command` and `shell` are not idempotent unless you guard them; native modules and `notify` handlers are."
- "`--extra-vars` (`-e`) always wins Ansible's 22-level variable precedence."
- "Molecule's best test is running the playbook twice and failing the build if the second run reports `changed > 0`."
- "In Qualys-style pods, `etm-audit-config-mgmt` holds the 90% cross-pod base; `etmaudit` holds the 10% pod delta + `quadfile.yaml` release order."
