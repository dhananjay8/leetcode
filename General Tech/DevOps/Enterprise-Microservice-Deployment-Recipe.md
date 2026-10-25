# Enterprise Microservice Deployment Recipe — Staff/Principal Deep Dive

> A repeatable, real-world recipe for rolling out a new microservice to a Kubernetes-based Qualys-style pod environment. The same pattern generalizes to any enterprise using a **three-repo model**: service repo, central config repo, and per-environment deployment repo.

---

## 1. TL;DR

1. Prepare the **service repo** (`etm-audit-<service>`): code, container, CI, config/consul/, config/helm/, Vault/S3/proxy wiring, actuator probes.
2. Build and publish: Jenkins builds the JAR, Docker image, and `consul/helm` zips.
3. Update **etm-audit-config-mgmt**: version property, `copy_consul`/`copy_helm` dependencies, base qhelm override.
4. Update **etmaudit** per pod: environment subproject, quadfile, qhelm override, consul overrides, qvaultsi policy.
5. Push to the correct pod branch and deploy.
6. Validate pods, health endpoints, and ingress.

---

## 2. Repositories and Responsibilities

| Repo | Role |
| --- | --- |
| `etm-audit-<service>` | Source code, unit tests, Dockerfile, Jenkins scripts, bundled consul/helm config |
| `etm-audit-config-mgmt` | Aggregates service-level config into a single release artifact; provides base qhelm overrides |
| `etmaudit` | Per-pod, per-environment deployment manifest (quadfile, qhelm overrides, consul overrides, qvaultsi policies) |

---

## 3. Phase 1 — Service Repository

### 3.1 Source and runtime configuration

**`pom.xml`**

- Use **JDK 17** toolchain in CI (`maven.compiler.release` / `java.version` may be higher locally, but build enforces JDK 17).
- Add `distributionManagement` pointing to trusted/snapshot repos so `mvn deploy` publishes the JAR and POM.
- Add the `config-release-maven-plugin` (com.qualys.aqui.config) to package `config/consul` and `config/helm`:
  - `moduleGroup`: `com.qualys.etmaudit`
  - `moduleName`: `etm-audit-<service>`
  - `consul.kvPrefix`: `etmaudit/apps/etm-audit-<service>`
  - `consul.sync.enabled`: `false` locally; Jenkins can override with `-Dconfig.consul.sync.enabled=true`.
- Include Spring Boot Actuator, Spring Cloud Consul Config, and Spring Cloud Vault.

**`src/main/resources/application.properties`**

- Keep environment-specific values as `${ENV_VAR:defaults}` (Oracle, S3 bucket/region/endpoint, proxy).
- `management.server.port=${MANAGEMENT_PORT:8080}`
- Expose `health`, `info`, `metrics`, `prometheus`.
- If exposing a web UI, keep `server.servlet.context-path` consistent with the ingress path.

**`config/consul/`**

| File | Purpose |
| --- | --- |
| `application.yaml` | App name, server port, management port, JPA/DDL defaults, actuator |
| `logback-spring.xml` | Standard logging config |
| `kafka-client.yaml` | Kafka truststore, bootstrap settings |
| `s3-client.yaml` | S3 bucket/region/endpoint placeholders |
| `proxy.yaml` | Corporate HTTP proxy host/port for AWS SDK v2 Apache client |

**`config/helm/etm-audit-<service>/`**

- `Chart.yaml` and `values.yaml` wrapper.
- These are the skeleton used by `etm-audit-config-mgmt` to build the umbrella chart.

### 3.2 Container build

**`build-scripts/Dockerfile`**

- Use the Qualys distroless non-root Zing JRE image.
- Copy `entrypoint.sh` and the fat JAR.
- Expose the app port.

**`build-scripts/image.env`**

```bash
image_name=etm-audit-<service>
release_repo=qualys/etm-audit
dev_repo=qualys/etm-audit
```

**`build-scripts/build-image.sh`**

- Builds and tags `art-hq.intranet.qualys.com:5001/<repo>/<image_name>:<version>` and `:<version>-<buildnumber>`.
- Supports `--cache-from` for faster rebuilds.

**`build-scripts/entrypoint.sh`**

- Reads Consul, Vault, Kafka, and Java options from environment.
- `SPRING_ACTIVE_PROFILE=override`.
- Adds `-Dmanagement.server.port`, `-Dserver.port`, `-Dspring.cloud.consul.*`, `-Dspring.cloud.vault.*`.
- Default `JAVA_OPTS`: `-Xmx2G -Xms100M` (override in qhelm with full GC flags).

### 3.3 Jenkins CI

- **Jenkinsfile**: use `generic-java-template-with-scripts` and point to `properties.yaml`.
- **properties.yaml**: set `maven: apache-maven-3.6.3`, `jdk: JDK_17`, `is-docker-scan-enabled: true`.
- **jenkins_build_scripts/variables**: `APPNAME`, `SONAR_ANALYZE`, `IS_INSTRUMENT_IMAGES=false`.
- **jenkins_build_scripts/build_script.sh**:
  - Enforces JDK 17 via `JAVA17_HOME`, `JDK_17_HOME`, or `/opt/qualys/java/jdk17`.
  - Runs `mvn clean deploy -DskipTests`.
  - Creates `VERSION.pkg` with `JAR_FILE`, `NAME`, `VERSION`, `RELEASE_NUMBER`.
  - Builds the Docker image with `build-scripts/build-image.sh`.
  - For release branches, runs SpotBugs and tags.
- **jenkins_build_scripts/post_build_script.sh**: pushes the image and, for release branches, creates the RC directory.

### 3.4 Build the service locally

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home

cd /Users/dhapatil/workspace/etma/etm-audit-<service>

mvn -q -DskipTests clean package
```

For local image builds, set `LOCAL_BUILD=true` so the script skips the deploy step.

---

## 4. Phase 2 — etm-audit-config-mgmt (Central Config)

This repo bundles every service's consul/helm config and produces `etm-audit-config-mgmt-<version>-{consul,helm,ansible}` artifacts.

### 4.1 Register the new service

**`gradle.properties`**

```properties
etm-audit-<service>.version=1.0.0-SNAPSHOT
```

**`build.gradle`**

Add the version property to the existing `copy_consul` and `copy_helm` blocks **only when** `etm-audit-config-mgmt` is aggregating the service's published consul/helm artifacts. For the p19/p43 central-helm flow, the version property is enough because the base qhelm override is checked into `etm-audit-config-mgmt` and pod-specific consul overrides live in `etmaudit`.

When aggregation is needed:

```groovy
copy_consul group: 'com.qualys.etmaudit', name: 'etm-audit-<service>',
            version: project.properties."etm-audit-<service>.version",
            ext: 'zip', classifier: 'consul', changing: true

copy_helm   group: 'com.qualys.etmaudit', name: 'etm-audit-<service>',
            version: project.properties."etm-audit-<service>.version",
            ext: 'zip', classifier: 'helm', changing: true
```

Keep:

```groovy
resolutionStrategy.cacheChangingModulesFor(0, 'seconds')
```

so SNAPSHOT updates are not silently cached.

### 4.2 Base qhelm override

Create or update `config/ansible/overrides/qhelm/etm-audit-<service>-values-override.yml`.

Use `@etm-audit-<service>.version@` as the image tag so the config-release token replacement fills it at build time:

```yaml
etm-audit-<service>:
  replicaCount: 1
  imageTag: "@etm-audit-<service>.version@"
  autoscaling:
    enabled: false
```

This base file contains **cross-pod defaults**: container spec, probes, volumes, Vault env, resources, Java options.

**Pod-specific values** (hostnames, URLs, credentials context, ingress, image tag override) live in `etmaudit/environment/<podKind>/<podName>/ansible/overrides/qhelm/`.

### 4.3 Build and publish

The Jenkinsfile uses the `generic-binaries-template` with `jenkins_build_scripts/build_script.sh`:

```bash
./gradlew clean build -Prelease-number=SNAPSHOT --refresh-dependencies

helm lint --with-subcharts build/config/helm/etm-audit-helm/

./gradlew publish -Prelease-number=SNAPSHOT --refresh-dependencies
```

For release branches, the build tags the repo and publishes to the trusted repository.

---

## 5. Phase 3 — etmaudit (Per-Pod Deployment)

One `etmaudit` environment subproject is created per pod, e.g. `environment/qa/sjc01-eng-p43` or `environment/dev/sjc01-eng-p19`.

### 5.1 Create the environment subproject

If the pod does not yet exist, create:

**`environment/<podKind>/<podName>/build.gradle`**

```groovy
apply plugin: 'com.qualys.aqui.config.environment'

ext.etm_audit_config_mgmt_version="0.5.0-SNAPSHOT"

environment {
    podProvider = "qualys"
    podKind = "qa"            // or "dev"
    podName = "sjc01-eng-p43" // or "sjc01-eng-p19"
    defaultConfigReleaseModuleName = "etm-audit-config-mgmt"
    defaultConfigReleaseModuleVersion = "0.5.0"
}

configurations.all {
    transitive = false
    resolutionStrategy.cacheChangingModulesFor(0, 'seconds')
}

repositories {
    maven { url "https://nexus.intranet.qualys.com/nexus/content/repositories/QualysTrusted" }
    maven { url "https://nexus.intranet.qualys.com/nexus/content/repositories/QualysSnapshot" }
    maven { url "https://nexus.intranet.qualys.com/nexus/content/groups/qualys-dev-all" }
}

dependencies {
    consul group: "com.qualys.etmaudit", name: "etm-audit-config-mgmt",
           version: "$etm_audit_config_mgmt_version", ext: "zip", classifier: "consul"
    helm   group: "com.qualys.etmaudit", name: "etm-audit-config-mgmt",
           version: "$etm_audit_config_mgmt_version", ext: "zip", classifier: "helm"
    ansible group: "com.qualys.etmaudit", name: "etm-audit-config-mgmt",
           version: "$etm_audit_config_mgmt_version", ext: "zip", classifier: "ansible"
}
```

**`settings.gradle`**

```groovy
include ':environment:<podKind>:<podName>'
```

### 5.2 Quadfile release entry

In `environment/<podKind>/<podName>/ansible/overrides/quadfile.yaml`, add a central-helm release:

```yaml
- chart: nexus/central-helm-chart
  release: etm-audit-<service>
  version: 1.0.0
  namespace: etmaudit
  rollback_on_failure: false
  wait_for_success: true      # set true for services others depend on
  reuse_values: false
  skip_review: false
  timeout: 700s
```

**Order matters.** For example, `etm-audit-library-sync-service` should deploy before `etm-audit-researcher-ui-service` because the UI releases depend on the sync service being available.

### 5.3 qhelm values override

Create `environment/<podKind>/<podName>/ansible/overrides/qhelm/etm-audit-<service>-values-override.yml`.

This file **overrides or extends** the base file from `etm-audit-config-mgmt` for the specific pod.

Key fields:

- `imageTag`: keep the `@etm-audit-<service>.version@` token from the base, or set an explicit tag such as `1.0.0-SNAPSHOT`.
- `SERVER_SERVLET_CONTEXT_PATH`: align with ingress path if exposing a UI (e.g., `/etma-researcher`).
- `CONSUL_PREFIXES`: `etmaudit/apps/etm-audit-<service>`.
- `VAULT_PATHS`: comma-separated list of only the secret paths the service needs (e.g., `secret/etm-audit/aws`, `secret/etm-audit/researcher-db`).
- `VAULT_AUTHENTICATION`: `approle`.
- `MANAGEMENT_PORT`: `9090`.
- `JAVA_OPTS`: full GC flags; quote carefully to avoid YAML parse errors.
- `probes`: point at management port and `/actuator/health/liveness`, `/actuator/health/readiness`.
- `ingress`: use `qualysguardIngressPath` with a regex if the path contains context (e.g., `/etma-researcher(/|$)(.*)`).
- `autoscaling.enabled: false` for initial rollouts; scale to 1 replica.

### 5.4 Common values override

In `environment/<podKind>/<podName>/ansible/overrides/qhelm/common-values-override.yml`, set pod-wide env:

- `kubeingresshost`, `qualysguardHost`
- `CONSUL_HOST`, `CONSUL_PORT`, `CONSUL_SCHEME`, `LI_CONSUL_HOST`
- `KAFKA_BOOTSTRAP_SERVERS`, `KAFKA_ZOOKEEPER_SERVERS`
- `LI_HTTPS_PROXY`
- `VAULT_HOST`, `VAULT_PORT`, `VAULT_ADDRESS`
- `ELASTIC_SEARCH_HOSTS`, `ELASTIC_SEARCH_CLUSTER`
- `ORACLE_URL`
- `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_S3_ENDPOINT`, `LIBRARY_SYNC_S3_BUCKET`, `LIBRARY_SYNC_ELASTICSEARCH_URL`

### 5.5 Consul overrides

Create `environment/<podKind>/<podName>/consul/etm-audit-<service>/`:

- `application.yaml` — pod-specific Spring config, JPA DDL mode, server/context path, actuator.
- `logback-spring.xml` — logging overrides.
- `kafka-client.yaml` — pod-specific Kafka truststore/SSL.
- `s3-client.yaml` — pod-specific S3/endpoint.

Consul KV paths merge with the base config pulled from `etm-audit-config-mgmt`; local files layer on top.

### 5.6 qvaultsi policy

Create `environment/<podKind>/<podName>/ansible/overrides/qvaultsi/etm-audit-<service>/etmaudit.hcl` (include **both** `secret/etm-audit/...` and `secret/data/etm-audit/...` because Vault KV v2 uses the `data/` prefix under the hood, and only include paths referenced in the service's `VAULT_PATHS`):

```hcl
"path" "secret/etm-audit/<service-secret>" {
  "capabilities" = ["read"]
}
"path" "secret/etm-audit/<service-secret>/*" {
  "capabilities" = ["read"]
}
"path" "secret/data/etm-audit/<service-secret>" {
  "capabilities" = ["read"]
}
"path" "secret/data/etm-audit/<service-secret>/*" {
  "capabilities" = ["read"]
}
```

### 5.7 Push to the right branch (Gerrit review workflow)

Do not create extra topic branches; push the working branch directly to `refs/for/<branch>`:

| Pod | Target branch | Push command |
| --- | --- | --- |
| Pod 43 (`qa`) | `qa` | `git push -u origin HEAD:refs/for/qa` |
| Pod 19 (`dev`) | `dev` | `git push -u origin HEAD:refs/for/dev` |

---

## 6. Phase 4 — Post-Deploy Validation, Rollback & Lessons Learned

### 6.1 Post-deploy validation commands

1. Check the pod is `Running` (`n/n` ready) in the `etmaudit` namespace.
2. Tail logs for startup errors (Consul/Vault/Oracle/S3/ES connection failures are the most common) and verify logs are written under `/var/log/app/` on the host.
3. Exercise the actuator endpoints on the **management port** (`9090`):

```bash
# Liveness
curl http://<pod-host>:<mgmt-port>/actuator/health/liveness

# Readiness
curl http://<pod-host>:<mgmt-port>/actuator/health/readiness
```

1. If the service exposes an ingress route, test through `https://qualysguard.<pod>.eng.sjc01.qualys.com/<context-path>` (or `kubeingress.<pod>.eng.sjc01.qualys.com/<context-path>`).

### 6.2 Rollback (per pod)

- **Primary**: revert the tag/values change in `etmaudit` pod branch → runner applies previous `imageTag`; config artifacts unchanged unless the failure was config-caused (then revert consul/helm override too).
- **Fast**: `helm rollback <release> <rev>` via the pod's release tooling, then immediately commit the matching revert to `etmaudit` so Git stays truth.
- `wait_for_success` releases that timed out leave the release `FAILED` — rollback first, then investigate; a second deploy over a failed release can mask the real error.

### 6.3 11 Hard-Won Lessons Learned from `p19` / `p43` Rollouts

1. **Kubernetes container port names must be `<= 15` characters**: Initial `central-helm` overrides named ports `http-etm-audit-researcher-ui-service-8080` and K8s API validation rejected them. Use short names like `http`.
2. **Quote `JAVA_OPTS`, regex `ingress` paths, and `@...@` image tag placeholders**: YAML parsers choke on unquoted `@etm-audit-<service>.version@` tokens, regex special characters, and multi-flag Java option strings.
3. **Align `SERVER_SERVLET_CONTEXT_PATH`, the ingress path, the React/Vite base, and the API base path**: Changing one without the others breaks UI asset/API routing.
4. **Trim `VAULT_PATHS` to the exact secrets the service needs**: Over-broad paths cause Vault mount/permission errors at Spring Cloud bootstrap.
5. **Include both `secret/etm-audit/...` and `secret/data/etm-audit/...` in `qvaultsi` policies**: Vault KV v2 requires both prefixes.
6. **Use `LI_HTTPS_PROXY` and an AWS SDK v2 Apache HTTP client for S3 in pods**: Direct public AWS endpoints are blocked by pod firewall rules.
7. **Separate management port from app port (`MANAGEMENT_PORT=9090`)**: Actuator liveness/readiness probes and Prometheus scraping must target `MANAGEMENT_PORT`, not the application port.
8. **Set `wait_for_success: true` for foundational services**: Prevents race conditions where `etm-audit-researcher-ui-service` starts before `etm-audit-library-sync-service` is ready.
9. **Disable HPA (`autoscaling.enabled: false`) and keep `replicaCount: 1` during initial rollouts**: Enable autoscaling only after the first rollout is verified stable.
10. **JPA `ddl-auto`: use `none` in production**: `update` was used in `p43` only during initial schema bootstrap; switch to `none` and use Flyway / checked-in DDL once stable.
11. **Never let Gradle cache `SNAPSHOT` config artifacts for 24 hours**: Keep `resolutionStrategy.cacheChangingModulesFor(0, 'seconds')` and `--refresh-dependencies`.

### 6.4 Common failure modes

| Symptom | Likely cause | Check |
| --- | --- | --- |
| `ImagePullBackOff` | Tag not pushed / registry perms / arch mismatch | `build-image.sh` output, registry listing |
| Pod starts, readiness never passes | Probe on wrong port (app vs `MANAGEMENT_PORT`) | `describe pod` probe URL vs actual port |
| App boots but config is default | Consul prefix wrong / sync disabled | `CONSUL_PREFIXES`, `consul.sync.enabled`, KV exists |
| `Vault: permission denied` | qvaultsi HCL missing the path (`secret/data/...`) | `VAULT_PATHS` vs `etmaudit.hcl` paths |
| Egress timeouts to S3/ES/Oracle | Proxy env not set for that pod | `LI_HTTPS_PROXY` in common override, AWS SDK v2 proxy client |
| Ingress 404 | Context-path/regex mismatch | `SERVER_SERVLET_CONTEXT_PATH` vs `qualysguardIngressPath` regex |
| Deploys pass but dependents fail | Ordering wrong in quadfile | Move dependency earlier, `wait_for_success: true` |
| SNAPSHOT stale after rebuild | Gradle cached changing module | `cacheChangingModulesFor(0, 'seconds')`, `--refresh-dependencies` |

### 6.5 Three-Repo File Checklist

- **Service repo (`etm-audit-<service>`)**:
  - `pom.xml` (JDK 17, `distributionManagement`, `config-release-maven-plugin`)
  - `src/main/resources/application.properties` (env-driven defaults + `management.server.port`)
  - `config/consul/{application.yaml, logback-spring.xml, kafka-client.yaml, s3-client.yaml, proxy.yaml}`
  - `config/helm/etm-audit-<service>/{Chart.yaml, values.yaml}`
  - `build-scripts/{Dockerfile, build-image.sh, image.env, entrypoint.sh}`
  - `jenkins_build_scripts/{build_script.sh, post_build_script.sh, variables}`, `Jenkinsfile`, `properties.yaml`
- **Config mgmt repo (`etm-audit-config-mgmt`)**:
  - `gradle.properties` (`etm-audit-<service>.version`)
  - `build.gradle` (`copy_consul` / `copy_helm` dependencies when aggregating)
  - `config/ansible/overrides/qhelm/etm-audit-<service>-values-override.yml`
- **Deployment repo (`etmaudit`)**:
  - `environment/<podKind>/<podName>/build.gradle` + `settings.gradle` include
  - `environment/<podKind>/<podName>/ansible/overrides/quadfile.yaml`
  - `environment/<podKind>/<podName>/ansible/overrides/qhelm/{etm-audit-<service>-values-override.yml, common-values-override.yml}`
  - `environment/<podKind>/<podName>/consul/etm-audit-<service>/*.yaml`
  - `environment/<podKind>/<podName>/ansible/overrides/qvaultsi/etm-audit-<service>/etmaudit.hcl`

---

## 7. Appendix: Deep Repo Anatomy & Mapping to K8s / DevOps Concepts

### 7.1 Mental Model — Qualys Stack vs Standard K8s / GitOps

| Concept in the Qualys stack | Standard K8s / DevOps concept | Repo that owns it |
| --- | --- | --- |
| `etm-audit-<service>` source + container | Application code, Docker image | `etm-audit-<service>` |
| `config/consul`, `config/helm` in service repo | Default config bundles (Consul KV, Helm wrapper) | `etm-audit-<service>` |
| `etm-audit-config-mgmt` | Central config release factory / umbrella artifact (`-{consul,helm,ansible}.zip`) | `etm-audit-config-mgmt` |
| `etmaudit/environment/<pod>` | Per-cluster / per-environment deployment manifest (ArgoCD `ApplicationSet` overlay) | `etmaudit` (Gerrit repo) |
| `quadfile.yaml` | Helm release plan / deployment order (ArgoCD App-of-Apps + Sync Waves) | `etmaudit` |
| `qhelm/<service>-values-override.yml` | Helm `values.yaml` for `nexus/central-helm-chart` | `etmaudit` + `etm-audit-config-mgmt` |
| `consul/<service>/` | Consul KV paths read at runtime by Spring Cloud Consul (`ConfigMap` equivalent) | `etmaudit` + `etm-audit-config-mgmt` |
| `qvaultsi/<service>/etmaudit.hcl` | Vault ACL policy for the service account | `etmaudit` |
| `ansible` | Deployment orchestrator that runs Helm, Consul sync, `qvaultsi` | `etm-audit-config-mgmt` + `etmaudit` |
| `art-hq.intranet.qualys.com:5001` | Docker registry | external |
| `nexus.intranet.qualys.com` | Maven / artifact repository | external |

### 7.2 Inside `etm-audit-config-mgmt` (Central Config Release Factory)

| File / folder | K8s / DevOps purpose |
| --- | --- |
| `build.gradle` | Defines `copy_consul`, `copy_helm`, `copy_jenkins`, `copy_prometheus`, `copy_alertmanager`, `copy_grafana`, `qvaultEssentials` configurations; pulls service artifacts from Nexus and assembles them |
| `gradle.properties` | Version catalog (`<service>.version` properties) |
| `jenkins_build_scripts/build_script.sh` | Builds artifact, runs `helm lint` on `build/config/helm/etm-audit-helm/`, tags release branches, runs `./gradlew publish` |
| `config/consul/` | Default Consul KV files for centrally bundled services (`auditya-orchestrator`, `etmaudit-mcp-server`) → zipped into `-consul.zip` |
| `config/helm/etm-audit-helm/` | Umbrella Helm chart for `etmaudit` namespace (`templates/roles.yaml` installs `Role`/`RoleBinding`); note: newer `p19`/`p43` services deploy via `nexus/central-helm-chart` instead |
| `config/ansible/overrides/qhelm/` | **Base** `qhelm` value overrides for every service + `common-values-override.yml` |
| `config/qvaultsi/etm-audit-secrets/etmaudit.hcl` | Generic Vault policy for `etm-audit` secrets (pod policies layer on top) |
| `build/config/` | Gradle output where `copyConfigs` merges local `config/` with downloaded service zips and replaces `@moduleVersion@` / `@<service>.version@` tokens |

**The `config {}` Gradle DSL (`com.qualys.aqui.config.release`)**:

```groovy
config {
    consul {
        kvPrefix = "etmaudit/apps"           // base KV path in Consul
        sync { enabled = true; deleteModeEnabled = true }
    }
    helm {
        namespace = "etm"                    // default Helm namespace
        sync { enabled = true; deleteModeEnabled = true }
    }
    apigateway { ... }
}
```

### 7.3 Inside `etmaudit` (Gerrit Per-Pod Deployment Repo) & Layout Evolution

| File / folder | K8s / DevOps purpose |
| --- | --- |
| `build.gradle` (root) & `settings.gradle` | Loads `config-gradle-plugins` classpath and lists `:environment:<podKind>:<podName>` subprojects |
| `environment/<podKind>/<podName>/build.gradle` | Per-pod entry point: declares `podProvider`, `podKind`, `podName`, `etm-audit-config-mgmt` version, and `consul`/`helm`/`ansible` zip dependencies |
| `.../ansible/overrides/quadfile.yaml` | Ordered Helm release plan (`helm upgrade --install` using `nexus/central-helm-chart`) |
| `.../ansible/overrides/qhelm/` | Pod-wide `common-values-override.yml` + per-service `<service>-values-override.yml` |
| `.../ansible/overrides/qvaultsi/<service>/etmaudit.hcl` | Per-pod Vault ACL policy applied by Ansible `qvaultsi` role |
| `.../ansible/overrides/secrets/` | Encrypted `.gpg` secrets when a secret is not in Vault |
| `.../consul/<service>/` | Pod-specific Consul KV overrides (`application.yaml`, `logback-spring.xml`, `kafka-client.yaml`, `s3-client.yaml`) pushed to `etmaudit/apps/<service>/` |
| `.../prometheus/`, `alertmanager/`, `terraform/`, `jenkins/` | Pod-level monitoring rules, IaC (DNS/LB), and Jenkins job definitions |

- **Two Repo Layouts in Production**:
  1. **`p43` pattern (newer, centralized)**: `build.gradle` depends on a single `etm-audit-config-mgmt` `{consul,helm,ansible}` artifact; `consul/<service>/` and `ansible/overrides/qhelm/` are flat under the pod (`etm-audit-researcher-ui-service`, `etm-audit-library-sync-service`).
  2. **`p04` pattern (older, per-service artifact)**: `build.gradle` depends directly on each service's own zips (`ea-catalog-svc`); overrides are nested under `ansible/<service>/<version>/` and `consul/<service>/<version>/`.

### 7.4 5-Step End-to-End Runtime Journey (From Commit to Pod Traffic)

1. **Service Build**: Jenkins runs `mvn clean deploy -DskipTests` (publishes JAR + `-consul.zip` + `-helm.zip` to Nexus) and `build-scripts/build-image.sh` (pushes image to `art-hq.intranet.qualys.com:5001`).
2. **Config Aggregation**: `etm-audit-config-mgmt` merges service zips, substitutes `@<service>.version@` tokens, runs `helm lint`, and publishes `etm-audit-config-mgmt-<version>-{consul,helm,ansible}.zip`.
3. **Pod Deployment**: Jenkins/Gradle in `etmaudit/environment/<pod>` runs **Ansible** roles:
   - `qvaultsi` → applies `etmaudit.hcl` to Vault.
   - `consul sync` → pushes merged YAML files to Consul KV `etmaudit/apps/<service>/`.
   - `helm install/upgrade` → iterates `quadfile.yaml`, running `helm upgrade --install <release> nexus/central-helm-chart -n etmaudit --values <merged qhelm overrides>` (blocking on `wait_for_success: true`).
4. **Pod Runtime Startup**:
   - Kubelet pulls the image from `art-hq`.
   - **Init container (`distroless-container`)** copies the Java truststore into a shared volume.
   - Main container starts `entrypoint.sh`, passing `-Dspring.cloud.consul.*`, `-Dspring.cloud.vault.*`, and `-Dmanagement.server.port=9090`.
   - Spring Cloud Consul reads `etmaudit/apps/<service>/`, Spring Cloud Vault reads `VAULT_PATHS`, and Actuator exposes liveness/readiness on `:9090`.
5. **Traffic Routing**: `central-helm-chart` provisions the Ingress (`kubeingress.<pod>.eng.sjc01.qualys.com/<context-path>`) → Service selects pods by `extralabels`/`podLabels` → forwards to `targetPort`.

### 7.5 Quick Glossary & 45-Second Interview Pitch

- **`qhelm`**: Qualys convention for layered Helm values files overriding `central-helm-chart`.
- **`quadfile`**: Ordered manifest of Helm releases applied to a pod with `wait_for_success` gating.
- **`qvaultsi`**: Ansible role that provisions per-service HCL read policies in HashiCorp Vault.
- **`central-helm-chart`**: Shared enterprise Helm chart hosted in Nexus so microservices don't duplicate Kubernetes YAML templates.
- **`config-gradle-plugins`**: `com.qualys.aqui.config.release` and `com.qualys.aqui.config.environment` plugins that package and sync Consul/Helm/Ansible/Vault artifacts.

> **45-Second Staff Pitch**: *"We operate a multi-pod regional Kubernetes platform using a strict three-repo GitOps model: the **service repo** builds immutable JDK 17 / distroless images and publishes versioned config zips; the **central config-mgmt repo** aggregates service versions into a release train and defines cross-pod base Helm overrides; and the **per-pod environment repo** (`etmaudit`) holds only the pod-specific delta — Consul KV overrides, least-privilege Vault HCL policies, and an ordered release manifest (`quadfile`) that gates dependent services on readiness probes (`wait_for_success: true`). That separation lets us roll out a new microservice across 15+ regional pods without duplicating YAML or ever committing a secret."*

---

## 8. Staff-Level Takeaways

- **Three-repo separation** decouples code release from config release from environment-specific deployment state.
- **Immutable artifacts**: every image and config artifact is version-tagged; no `latest`.
- **Layered configuration**: base defaults → central config overrides → pod-specific overrides → runtime env.
- **Secret discipline**: Vault/Consul at runtime; no secrets committed to repos.
- **Ordering and dependency awareness**: deploy foundational services before consumers.
- **Validation gates**: local build, CI, Helm lint, health/readiness probes, and smoke tests.
