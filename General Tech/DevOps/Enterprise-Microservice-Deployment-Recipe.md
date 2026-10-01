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
|---|---|
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
|---|---|
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

Create `environment/<podKind>/<podName>/ansible/overrides/qvaultsi/etm-audit-<service>/etmaudit.hcl`:

```hcl
path "secret/etm-audit/<service-secret>" {
  capabilities = ["read"]
}
```

---

## 6. Staff-Level Takeaways

- **Three-repo separation** decouples code release from config release from environment-specific deployment state.
- **Immutable artifacts**: every image and config artifact is version-tagged; no `latest`.
- **Layered configuration**: base defaults → central config overrides → pod-specific overrides → runtime env.
- **Secret discipline**: Vault/Consul at runtime; no secrets committed to repos.
- **Ordering and dependency awareness**: deploy foundational services before consumers.
- **Validation gates**: local build, CI, Helm lint, health/readiness probes, and smoke tests.
