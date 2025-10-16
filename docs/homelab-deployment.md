# TV Dashboard Homelab Deployment

Documentation for deploying TV Dashboard to the homelab MicroK8s cluster.

## Overview

TV Dashboard is deployed to homelab using GitOps with ArgoCD. This document covers the specific configuration and decisions made for this deployment.

For general information about deploying apps to homelab, see the [homelab deployment guide](https://github.com/navillasa/homelab/blob/main/docs/deploying-apps.md).

## Architecture

- **Frontend:** React + Vite (nginx container)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Public URL:** https://tv-hub.navillasa.dev
- **Environment:** Production (homelab prod overlay)

## Deployment Configuration

### Kustomize Structure

```
k8s-gitops/
├── base/
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml
│   └── ingress.yaml
└── overlays/
    ├── gke/                        # Google Cloud deployment
    └── prod/                       # Homelab deployment
        ├── kustomization.yaml
        ├── external-secret-database.yaml
        ├── external-secret-api.yaml
        ├── postgres-homelab-patch.yaml
        ├── frontend-patch.yaml
        └── ingress-homelab-patch.yaml
```

### Secrets Management

Secrets are stored in HashiCorp Vault and synced to Kubernetes via External Secrets Operator.

**Vault Paths:**
- `secret/tv-dashboard/postgres` - PostgreSQL credentials
- `secret/tv-dashboard/api` - TMDB API key

**Kubernetes Secrets Created:**
- `postgres-secret` - Database username and password
- `api-secrets` - TMDB API key

### Storage

PostgreSQL uses local storage on the homelab host:

```yaml
# postgres-homelab-patch.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: microk8s-hostpath
```

**Data Location:** `/var/snap/microk8s/common/default-storage/`

### Ingress & Public Access

**Subdomain:** tv-hub.navillasa.dev

**SSL/TLS:** Handled by Cloudflare Tunnel (automatic SSL at edge)

**Routing:**
- `/api/*` → Backend service (port 4000)
- `/*` → Frontend service (port 80)

```yaml
# ingress-homelab-patch.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tv-dashboard-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: public
  rules:
  - host: tv-hub.navillasa.dev
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 4000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

**Cloudflare Tunnel:** Configured to route `tv-hub.navillasa.dev` to `http://localhost:80` on the homelab host. DNS managed via Cloudflare dashboard (CNAME to tunnel).

### Backend Configuration

The backend deployment includes specific configuration for homelab:

**IPv4 DNS Preference:**

Node.js prefers IPv4 for external API calls to avoid IPv6 timeout issues:

```yaml
# In base/backend-deployment.yaml
env:
  - name: NODE_OPTIONS
    value: "--dns-result-order=ipv4first"
```

**Why:** MicroK8s pods don't have working IPv6 connectivity for outbound requests. Without this setting, Node.js fetch() tries IPv6 first (from DNS) and times out when connecting to TMDB and TVmaze APIs.

### Frontend Configuration

Frontend nginx configuration uses environment variable substitution for backend service name:

```nginx
# frontend/nginx.conf (template)
location /api/ {
  proxy_pass http://${BACKEND_SERVICE}:4000;
  # ...
}
```

```yaml
# In deployment
env:
  - name: BACKEND_SERVICE
    value: "prod-backend-service"
```

This allows the same Docker image to work in different environments (dev/prod) with different service names.

## Deployment Process

### Initial Deployment

1. **Store secrets in Vault** (see homelab deployment guide)

2. **Configure Cloudflare Tunnel** to route subdomain to homelab ingress

3. **Deploy via ArgoCD:**
   ```bash
   argocd app create tv-dashboard-prod \
     --repo https://github.com/navillasa/tv-dashboard-k8s.git \
     --path k8s-gitops/overlays/prod \
     --dest-namespace tv-dashboard-prod \
     --dest-server https://kubernetes.default.svc \
     --sync-policy automated \
     --auto-prune \
     --self-heal
   ```

4. **Verify deployment:**
   ```bash
   argocd app get tv-dashboard-prod
   microk8s kubectl get pods -n tv-dashboard-prod
   curl https://tv-hub.navillasa.dev/
   ```

### Updating the Application

Changes to code trigger CI/CD which builds new Docker images:

1. CI builds and pushes images to `ghcr.io/navillasa/tv-dashboard-k8s/`
2. CI creates git tag: `v{YYYYMMDD}-{git-sha}`
3. Update `k8s-gitops/overlays/prod/kustomization.yaml`:
   ```yaml
   images:
     - name: tv-dashboard-backend
       newName: ghcr.io/navillasa/tv-dashboard-k8s/backend
       newTag: v20251016-1bcaf75
   ```
4. Commit and push
5. ArgoCD syncs automatically (~3 min) or sync manually:
   ```bash
   argocd app sync tv-dashboard-prod
   ```

## Monitoring & Debugging

### Check Application Status

```bash
# ArgoCD status
argocd app get tv-dashboard-prod

# Pods
microk8s kubectl get pods -n tv-dashboard-prod

# Logs
microk8s kubectl logs -n tv-dashboard-prod deployment/prod-backend -f
microk8s kubectl logs -n tv-dashboard-prod deployment/prod-frontend -f
microk8s kubectl logs -n tv-dashboard-prod deployment/prod-postgres -f

# Ingress
microk8s kubectl get ingress -n tv-dashboard-prod -o yaml

# Services
microk8s kubectl get svc -n tv-dashboard-prod
```

### Test API Endpoints

```bash
# From homelab host (localhost)
curl -H "Host: tv-hub.navillasa.dev" http://localhost/
curl -H "Host: tv-hub.navillasa.dev" http://localhost/api/shows

# From anywhere (public)
curl https://tv-hub.navillasa.dev/
curl https://tv-hub.navillasa.dev/api/shows
```

### Check Secrets

```bash
# ExternalSecrets status
microk8s kubectl get externalsecret -n tv-dashboard-prod
microk8s kubectl describe externalsecret -n tv-dashboard-prod

# Kubernetes secrets (won't show values)
microk8s kubectl get secret -n tv-dashboard-prod

# Verify in Vault (see homelab deployment guide)
```

### Database Access

```bash
# Connect to PostgreSQL pod
microk8s kubectl exec -it -n tv-dashboard-prod deployment/prod-postgres -- psql -U tvshows -d tvshows

# Run queries
SELECT * FROM shows LIMIT 10;
```

## Issues Encountered & Solutions

### Issue 1: IPv6 Timeout Errors

**Symptom:** Backend logs showed `ETIMEDOUT` errors when fetching from TMDB/TVmaze APIs.

**Root Cause:** Node.js tried to connect via IPv6 (DNS returns IPv6 first) but pods don't have working IPv6 connectivity.

**Solution:** Added `NODE_OPTIONS=--dns-result-order=ipv4first` to backend deployment env vars.

**File:** `k8s-gitops/base/backend-deployment.yaml:31-32`

### Issue 2: Frontend Nginx Template Variable Not Set

**Symptom:** Frontend pods crashed with "host not found in upstream 'dev-backend-service'".

**Root Cause:** Nginx template used `${BACKEND_SERVICE}` but the variable wasn't set in all environments (missing in docker-compose.test.yml).

**Solution:** Added `BACKEND_SERVICE` env var to all environments including CI test environment.

**Files:**
- `docker-compose.test.yml`
- `k8s-gitops/base/frontend-deployment.yaml`
- `k8s-gitops/overlays/prod/frontend-patch.yaml`

## Key Differences: Homelab vs. GKE

| Aspect | GKE Deployment | Homelab Deployment |
|--------|----------------|-------------------|
| **Secrets** | Google Secret Manager | HashiCorp Vault + External Secrets |
| **Ingress** | GCE ingress class | MicroK8s nginx (`public` class) |
| **SSL/TLS** | Google-managed certificates (cert-manager) | Cloudflare Tunnel (automatic) |
| **Load Balancer** | Google Cloud Load Balancer | Cloudflare edge network |
| **Storage** | Google Persistent Disk | MicroK8s hostpath |
| **Public Access** | Direct via GCP IP | Via Cloudflare Tunnel |
| **IPv6** | Works | Not configured (IPv4 only) |

## References

- [Homelab Deployment Guide](https://github.com/navillasa/homelab/blob/main/docs/deploying-apps.md)
- [Homelab Cloudflare Tunnel Setup](https://github.com/navillasa/homelab/blob/main/setup/cloudflare-tunnel.md)
- [Homelab Vault Setup](https://github.com/navillasa/homelab/blob/main/k8s/vault/)
- [TV Dashboard README](../README.md)
