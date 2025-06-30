# TV Dashboard - Starter Makefile
# Usage: make <target>
# Run these on your dev box (not on your laptop unless you want to!)

PROJECT_ID ?= your-gcp-project-id
REGION ?= us-central1
ZONE ?= us-central1-c
CLUSTER_NAME ?= tv-dashboard-gke

# Images (update if you push to a private registry)
BACKEND_IMAGE ?= gcr.io/$(PROJECT_ID)/tv-dashboard-backend:latest
FRONTEND_IMAGE ?= gcr.io/$(PROJECT_ID)/tv-dashboard-frontend:latest

# --- Install Dependencies ---
install:
	@echo "Installing system dependencies (Ubuntu/Debian only)..."
	sudo apt-get update
	sudo apt-get install -y docker.io make terraform kubectl google-cloud-sdk curl

	@echo "Installing Node.js (v18)..."
	curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
	sudo apt-get install -y nodejs

	@echo "Installing frontend dependencies..."
	cd frontend && npm install

	@echo "Installing backend dependencies..."
	cd backend && npm install

	@echo ""
	@echo "If this is your first time, run: gcloud auth login"
	@echo "And: gcloud auth application-default login"
	@echo "Then set your project with: gcloud config set project $(PROJECT_ID)"

# --- Infrastructure ---
infra-init:
	cd infra && terraform init

infra-plan:
	cd infra && terraform plan -var="project_id=$(PROJECT_ID)"

infra-apply:
	cd infra && terraform apply -auto-approve -var="project_id=$(PROJECT_ID)"

infra-destroy:
	cd infra && terraform destroy -auto-approve -var="project_id=$(PROJECT_ID)"

# --- Docker Images ---
docker-build-backend:
	docker build -t $(BACKEND_IMAGE) ./backend

docker-build-frontend:
	docker build -t $(FRONTEND_IMAGE) ./frontend

docker-build: docker-build-backend docker-build-frontend

docker-push-backend:
	docker push $(BACKEND_IMAGE)

docker-push-frontend:
	docker push $(FRONTEND_IMAGE)

docker-push: docker-push-backend docker-push-frontend

# --- Kubernetes ---
kubeconfig:
	gcloud container clusters get-credentials $(CLUSTER_NAME) --zone $(ZONE) --project $(PROJECT_ID)

k8s-deploy:
	kubectl apply -f k8s/

k8s-status:
	kubectl get pods -o wide
	kubectl get svc
	kubectl get ingress

k8s-clean:
	kubectl delete -f k8s/ --ignore-not-found

# --- Full Pipeline ---
deploy: infra-apply docker-build docker-push kubeconfig k8s-deploy k8s-status

# --- Help ---
help:
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .+' Makefile | sed 's/:.*##/:/g' | column -t -s ':'

.DEFAULT_GOAL := help
