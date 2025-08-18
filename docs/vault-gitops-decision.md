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

### Layer 1: GitOps Platform
- **ArgoCD** (kubectl apply)
- **ClusterSecretStore** (ArgoCD)

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

---

*This decision reflects my specific context and learning goals. Your environment may have different constraints and requirements.*
