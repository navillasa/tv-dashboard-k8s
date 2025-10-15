# Why I Didn't Make Vault an ArgoCD Application

*A brief architectural decision record on secret management and GitOps boundaries*

## The Question

During the GitOps implementation, I considered whether HashiCorp Vault should be managed as an ArgoCD application alongside the other workloads. This post explains why I chose to keep Vault outside of the GitOps workflow.

## The Temptation

At first glance, managing Vault through ArgoCD seems appealing:

- **Consistency**: Everything else is managed by ArgoCD
- **Version Control**: Vault configuration tracked in Git
- **Declarative**: Infrastructure as Code principles
- **Automation**: Automated deployments and updates

## The Bootstrap Problem

The fundamental issue is a **circular dependency**:

```
┌─────────────┐    needs    ┌──────────────────┐    needs    ┌───────────┐
│   ArgoCD    │ ──────────► │ External Secrets │ ──────────► │   Vault   │
│             │             │    Operator      │             │           │
└─────────────┘             └──────────────────┘             └───────────┘
       ▲                                                            │
       │                    manages (if GitOps)                     │
       └────────────────────────────────────────────────────────────┘
```

**The problem**: If ArgoCD manages Vault, then ArgoCD depends on Vault (for secrets) which depends on ArgoCD (for deployment). This creates an unresolvable bootstrap dependency.

## Infrastructure Layers

I solved this by establishing clear **infrastructure layers**:

### Layer 0: Foundation Infrastructure
- **GKE Cluster** (Terraform)
- **Static IPs** (Terraform)
- **Vault** (kubectl apply)
- **External Secrets Operator** (Helm)
- **ClusterSecretStore** (kubectl apply)

### Layer 1: GitOps Platform
- **ArgoCD** (kubectl apply)

### Layer 2: Applications
- **tv-dashboard-dev** (ArgoCD)
- **tv-dashboard-prod** (ArgoCD)
- **monitoring-stack** (ArgoCD)

## Alternative Approaches Considered

### 1. Manual Sync Only
```yaml
# vault-app.yaml
spec:
  syncPolicy:
    automated: null  # No auto-sync to avoid bootstrap issues
```

**Pros**: Vault config in Git  
**Cons**: Manual intervention required, defeats GitOps automation

### 2. App-of-Apps Pattern
```yaml
# bootstrap-app.yaml - deployed manually
# Manages vault-app.yaml and argocd-apps.yaml
```

**Pros**: Complete GitOps coverage  
**Cons**: Complex bootstrap sequence, harder to debug

### 3. External Vault
Use a managed secret service (Google Secret Manager, AWS Secrets Manager)

**Pros**: No bootstrap problem, less operational overhead  
**Cons**: Vendor lock-in, less learning value for this project

## The Decision: Keep Vault Outside GitOps

**Reasons**:

1. **Operational Simplicity**: Vault is foundational infrastructure that should be stable and simple to manage
2. **Recovery Scenarios**: If ArgoCD fails, we can still access Vault to recover secrets
3. **Bootstrap Clarity**: Clear separation between foundation and application layers
4. **Production Patterns**: Many organizations treat secret management as Layer 0 infrastructure

## Production Considerations

In production environments, you might see:

### Large Organizations
- **Dedicated Vault clusters** managed by platform teams
- **Vault-as-a-Service** provided to application teams
- **Manual deployment** with infrastructure automation (Terraform)

### Cloud-Native Shops
- **Managed secret services** (AWS Secrets Manager, etc.)
- **External Secrets Operator** connecting to cloud providers
- **No self-hosted Vault** at all

### GitOps Purists
- **Everything in Git** including Vault
- **Complex bootstrap procedures** with operator dependencies
- **Acceptance of operational complexity** for consistency

## Key Takeaway

**Not everything needs to be in GitOps.** The right architectural boundary depends on:

- **Operational complexity** vs **consistency benefits**
- **Bootstrap dependencies** and **recovery scenarios**  
- **Team structure** and **operational expertise**
- **Compliance requirements** and **audit trails**

For my TV Dashboard project, keeping Vault as foundational infrastructure provided the right balance of simplicity and functionality while still demonstrating modern secret management practices.

## What I Learned

1. **Architectural boundaries matter** - not every tool fits every pattern
2. **Bootstrap dependencies** are real constraints in system design
3. **Operational simplicity** often trumps theoretical consistency
4. **Production patterns** should inform learning project decisions

The goal isn't perfect GitOps coverage—it's building systems that are **reliable, maintainable, and appropriate for their context**.

## Infrastructure Separation (October 2025 Update)

After deploying to my homelab, I further refined the infrastructure boundaries by **moving Layer 0 resources to a separate repository**.

### What Changed

**Before**: Vault and External Secrets manifests lived in this repo (`k8s-gitops/base/vault/`, `k8s-gitops/base/external-secrets/`) but weren't managed by ArgoCD.

**After**: All Layer 0 infrastructure moved to the [homelab repository](https://github.com/navillasa/homelab):
- `homelab/k8s/vault/` - Vault deployment manifests
- `homelab/k8s/external-secrets/` - ClusterSecretStore and ServiceAccounts

### Why This Is Better

1. **Clearer Boundaries**: Application repo (`tv-dashboard-k8s`) contains only application resources. Infrastructure repo (`homelab`) contains cluster-wide resources.

2. **Reusability**: When I add a second project, it references the same Vault and ClusterSecretStore from the homelab repo, not duplicated infrastructure.

3. **Easier Onboarding**: If someone clones `tv-dashboard-k8s` to deploy their own TV dashboard, they don't get Vault manifests they don't need.

4. **Matches Mental Model**: The homelab repo represents "my cluster and its infrastructure". Application repos represent "things running on the cluster".

### How It Works Now

```
homelab/ (github.com/navillasa/homelab)
├── k8s/
│   ├── vault/              # Layer 0: Vault deployment
│   │   └── *.yaml
│   └── external-secrets/   # Layer 0: ClusterSecretStore, ServiceAccounts
│       └── *.yaml
│
tv-dashboard-k8s/ (this repo)
└── k8s-gitops/
    └── overlays/
        └── prod/
            ├── external-secret-database.yaml  # References ClusterSecretStore from homelab
            └── external-secret-api.yaml       # References ClusterSecretStore from homelab
```

**Deployment sequence**:
1. Deploy Vault: `kubectl apply -k homelab/k8s/vault`
2. Configure Vault (init, unseal, create policies)
3. Deploy External Secrets infrastructure: `kubectl apply -f homelab/k8s/external-secrets/`
4. Deploy application via ArgoCD: references existing ClusterSecretStore

### Lessons Learned

- **Repository boundaries should match operational boundaries** - infrastructure managed separately from applications
- **Layer 0 should be truly foundational** - if multiple projects use it, it doesn't belong in a single project's repo
- **Documentation matters** - clear READMEs in the infrastructure repo explain what's deployed and why

This pattern scales well: when I add more projects (e.g., a home automation dashboard, media server management UI), they'll all reference the same Layer 0 infrastructure from the homelab repo.

---

*This decision reflects my specific context and learning goals. Your environment may have different constraints and requirements.*
