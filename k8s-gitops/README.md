# TV Dashboard GitOps

This directory contains the Kubernetes manifests for the TV Dashboard application, organized using Kustomize for multi-environment deployments.

## Structure

```
k8s-gitops/
├── base/                    # Base Kubernetes manifests
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   ├── postgres-*.yaml     # PostgreSQL database
│   ├── backend-*.yaml      # Node.js API server
│   ├── frontend-*.yaml     # React frontend
│   └── ingress.yaml        # Load balancer configuration
├── overlays/               # Environment-specific customizations
│   ├── dev/               # Development environment
│   ├── staging/           # Staging environment (coming soon)
│   └── prod/              # Production environment (coming soon)
└── argocd/                # ArgoCD applications (coming soon)
```

## Prerequisites

1. **GKE Autopilot Cluster**: Deploy using the Terraform configuration in `../infra/`
2. **kubectl**: Configured to access your cluster
3. **API Keys**: TMDB API key for fetching TV show data

## Quick Start

### 1. Deploy the Infrastructure

```bash
cd ../infra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your GCP project details
terraform init
terraform plan
terraform apply
```

### 2. Configure kubectl

```bash
# Get the kubectl config command from Terraform output
terraform output kubectl_config_command
# Run the outputted command, it will look like:
# gcloud container clusters get-credentials tv-dashboard-autopilot --region=us-east1 --project=your-project
```

### 3. Create Secrets

Before deploying, create the required secrets:

```bash
# Create the namespace first
kubectl create namespace tv-dashboard-dev

# Create database secret
kubectl create secret generic postgres-secret \
  --from-literal=username="postgres" \
  --from-literal=password="your-secure-password" \
  -n tv-dashboard-dev

# Create API secrets
kubectl create secret generic api-secrets \
  --from-literal=tmdb-api-key="your-tmdb-api-key" \
  -n tv-dashboard-dev
```

### 4. Deploy the Application

```bash
# Deploy to dev environment
kubectl apply -k overlays/dev/
```

### 5. Access the Application

```bash
# Get the ingress IP
kubectl get ingress -n tv-dashboard-dev

# Or port-forward for immediate access
kubectl port-forward -n tv-dashboard-dev svc/dev-frontend-service 8080:80
# Then visit http://localhost:8080
```

## Security Best Practices

- **No Hardcoded Secrets**: All sensitive data is managed through Kubernetes secrets
- **External Secrets**: Production setup will use External Secrets Operator with HashiCorp Vault
- **Least Privilege**: Each component has minimal required permissions
- **Resource Limits**: All containers have CPU and memory limits defined
- **Health Checks**: Liveness and readiness probes ensure reliability

## Coming Soon

- [ ] Staging and Production environments
- [ ] ArgoCD for GitOps workflow
- [ ] External Secrets Operator integration
- [ ] HashiCorp Vault for secret management
- [ ] Prometheus + Grafana monitoring stack
- [ ] Redis caching layer
- [ ] Horizontal Pod Autoscaling

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n tv-dashboard-dev

# View pod logs
kubectl logs -n tv-dashboard-dev <pod-name>

# Describe pod for events
kubectl describe pod -n tv-dashboard-dev <pod-name>
```

### Database Connection Issues

```bash
# Check if postgres is running
kubectl get pods -n tv-dashboard-dev -l app=postgres

# Test database connectivity
kubectl exec -it -n tv-dashboard-dev <postgres-pod> -- psql -U postgres -d tvshows -c "\dt"
```

### Ingress Not Working

```bash
# Check ingress status
kubectl get ingress -n tv-dashboard-dev
kubectl describe ingress -n tv-dashboard-dev tv-dashboard-ingress

# GKE ingress can take 5-10 minutes to provision
```
