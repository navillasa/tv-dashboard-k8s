#!/bin/bash

# Promote a specific version from dev to production
# Usage: ./scripts/promote-to-prod.sh v20250819-abc123

set -e

VERSION=${1}

if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    echo "Available versions:"
    gcloud container images list-tags gcr.io/tv-dashboard-k8s/tv-dashboard-frontend --limit=5 --format="value(tags)"
    exit 1
fi

echo "🚀 Promoting version $VERSION to production..."

# Update prod manifests with the specified version
sed -i.bak "s|gcr.io/tv-dashboard-k8s/tv-dashboard-backend:.*|gcr.io/tv-dashboard-k8s/tv-dashboard-backend:$VERSION|g" k8s-gitops/overlays/prod/backend-prod-patch.yaml
sed -i.bak "s|gcr.io/tv-dashboard-k8s/tv-dashboard-frontend:.*|gcr.io/tv-dashboard-k8s/tv-dashboard-frontend:$VERSION|g" k8s-gitops/overlays/prod/frontend-prod-patch.yaml

# Clean up backup files
rm -f k8s-gitops/overlays/prod/*.bak

echo "📝 Updated production manifests. Review changes:"
git diff k8s-gitops/overlays/prod/

echo ""
read -p "🤔 Do you want to commit and deploy to production? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add k8s-gitops/overlays/prod/
    git commit -m "deploy: promote $VERSION to production

Promoting tested version from dev environment:
- Backend: gcr.io/tv-dashboard-k8s/tv-dashboard-backend:$VERSION
- Frontend: gcr.io/tv-dashboard-k8s/tv-dashboard-frontend:$VERSION
"
    git push
    
    echo "✅ Promotion complete! ArgoCD will sync production in ~30 seconds."
    echo "🔗 Monitor: https://argocd.navillasa.dev"
else
    echo "❌ Promotion cancelled. Reverting changes..."
    git checkout -- k8s-gitops/overlays/prod/
fi
