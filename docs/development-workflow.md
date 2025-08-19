# ✨ Development Workflow Guide

*Guide to building features with my dev/prod environments*

## 🏗️ Environment Overview

```
Development Environment:
• URL: dev.tv-hub.navillasa.dev  
• Purpose: Feature development & testing
• Auto-deploy: Yes (on every push to main)
• ArgoCD App: tv-dashboard-dev

Production Environment:  
• URL: tv-hub.navillasa.dev
• Purpose: Live site for users
• Auto-deploy: No (manual promotion)
• ArgoCD App: tv-dashboard-prod
```

## 🔄 Feature Development Workflow

### **Step 1: Local Development**
```bash
# Start working on a new feature
git checkout -b feature/new-tv-search

# Make your changes to:
# - backend/src/ (API changes)
# - frontend/src/ (UI changes)  
# - k8s-gitops/ (infrastructure changes if needed)

# Test locally
cd backend && npm run dev
cd frontend && npm run dev
```

### **Step 2: Build & Push Images**
```bash
# Build new Docker images (bump version)
docker build -t gcr.io/tv-dashboard-k8s/tv-dashboard-backend:v1.5 ./backend
docker build -t gcr.io/tv-dashboard-k8s/tv-dashboard-frontend:v1.3 ./frontend

# Push to registry
docker push gcr.io/tv-dashboard-k8s/tv-dashboard-backend:v1.5
docker push gcr.io/tv-dashboard-k8s/tv-dashboard-frontend:v1.3
```

### **Step 3: Update Dev Environment**
```bash
# Update dev to use new image versions
vim k8s-gitops/overlays/dev/kustomization.yaml

# Change:
images:
- name: tv-dashboard-backend
  newName: gcr.io/tv-dashboard-k8s/tv-dashboard-backend
  newTag: v1.5  # <-- Update this
- name: tv-dashboard-frontend  
  newName: gcr.io/tv-dashboard-k8s/tv-dashboard-frontend
  newTag: v1.3  # <-- Update this
```

### **Step 4: Deploy to Dev (Auto)**
```bash
# Commit and push
git add -A
git commit -m "feat: add new TV search functionality

- Add search by genre endpoint
- Update frontend search UI
- Deploy v1.5 backend, v1.3 frontend"

git push origin feature/new-tv-search

# Merge to main (or push directly to main)
git checkout main
git merge feature/new-tv-search
git push origin main

# 🎉 ArgoCD automatically deploys to dev!
```

### **Step 5: Test in Dev Environment**
```bash
# Your feature is now live at:
# https://dev.tv-hub.navillasa.dev

# Test thoroughly:
# - New functionality works
# - Existing features still work  
# - API endpoints respond correctly
# - UI looks good

# Check ArgoCD for deployment status
kubectl get applications -n argocd
```

### **Step 6: Promote to Production (Manual)**
```bash
# Only after dev testing is complete!
vim k8s-gitops/overlays/prod/kustomization.yaml

# Update production to use tested versions:
images:
- name: tv-dashboard-backend
  newName: gcr.io/tv-dashboard-k8s/tv-dashboard-backend  
  newTag: v1.5  # <-- Promote from dev
- name: tv-dashboard-frontend
  newName: gcr.io/tv-dashboard-k8s/tv-dashboard-frontend
  newTag: v1.3  # <-- Promote from dev

# Commit the promotion
git add k8s-gitops/overlays/prod/kustomization.yaml
git commit -m "promote: v1.5 backend, v1.3 frontend to production

✅ Tested in dev environment
✅ All functionality verified  
✅ Ready for production users"

git push origin main

# 🚢 ArgoCD deploys to production!
```

## 🎯 **The Beautiful Part**

**This workflow demonstrates:**
- ✅ **Environment isolation**: Dev changes don't affect prod
- ✅ **Intentional promotion**: Production updates are deliberate  
- ✅ **GitOps principles**: Everything tracked in Git
- ✅ **Testing pipeline**: Dev validates before prod
- ✅ **Rollback capability**: Can revert to previous versions

## 🔧 Operational Commands

### **Check Environment Status**
```bash
# See all applications
kubectl get applications -n argocd

# Check specific environment pods
kubectl get pods -n tv-dashboard-dev
kubectl get pods -n tv-dashboard-prod

# View application logs
kubectl logs -f deployment/dev-backend -n tv-dashboard-dev
kubectl logs -f deployment/prod-backend -n tv-dashboard-prod
```

### **Emergency Procedures**

#### **Rollback Production**
```bash
# If prod has issues, rollback to previous version
vim k8s-gitops/overlays/prod/kustomization.yaml

# Change back to previous working tags:
newTag: v1.4  # Previous working version

git commit -m "hotfix: rollback to v1.4 due to production issue"
git push origin main
```

#### **Fix Dev Issues**
```bash
# If dev environment has problems:
kubectl rollout restart deployment dev-backend -n tv-dashboard-dev
kubectl rollout restart deployment dev-frontend -n tv-dashboard-dev

# Or check ArgoCD sync status:
kubectl get application tv-dashboard-dev -n argocd -o yaml
```

### **Secret Updates**
```bash
# Update secrets in Vault (affects both environments)
kubectl exec -n vault <vault-pod> -- vault kv put tv-dashboard/dev/api tmdb_api_key=new-key
kubectl exec -n vault <vault-pod> -- vault kv put tv-dashboard/prod/api tmdb_api_key=new-key

# External Secrets will auto-sync within 30 seconds!
```