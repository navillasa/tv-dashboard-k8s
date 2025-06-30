# Terraform GKE Infrastructure

This directory provisions a minimal, cheap GKE cluster for your TV Dashboard project.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads)
- [gcloud CLI](https://cloud.google.com/sdk/docs/install)
- GCP project with billing enabled

## Usage

1. **Authenticate with Google:**
   ```bash
   gcloud auth application-default login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Initialize & Apply Terraform:**
   ```bash
   cd infra
   terraform init
   terraform apply -var="project_id=YOUR_PROJECT_ID"
   ```

3. **Configure kubectl:**
   - Use the outputted `kubeconfig` to connect:
     ```bash
     terraform output kubeconfig > kubeconfig.yaml
     export KUBECONFIG=$PWD/kubeconfig.yaml
     kubectl get nodes
     ```

4. **Deploy your app!**
   - Apply your K8s manifests from the main repo.

## Notes

- **Free Tier:** The first e2-micro node in some regions is free (check [GCP Free Tier](https://cloud.google.com/free/docs/gcp-free-tier#compute)).
- **Cheapest Setup:** This is a zonal (not regional) cluster, no control plane fee.
- **Destroy:**  
  ```bash
  terraform destroy -var="project_id=YOUR_PROJECT_ID"
  ```

---
