provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.zone

  remove_default_node_pool = true
  initial_node_count       = 1

  # Cheapest (zonal, no control plane fee)
  network    = "default"
  subnetwork = "default"
  deletion_protection = false
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "primary-node-pool"
  location   = var.zone
  cluster    = google_container_cluster.primary.name

  node_count = 1

  node_config {
    preemptible  = true
    machine_type = "e2-micro" # eligible for free-tier (1 always-free per month)
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
    labels = {
      env = "dev"
    }
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
}

# Optionally, create a service account for K8s management
resource "google_service_account" "k8s" {
  account_id   = "k8s-sa"
  display_name = "Kubernetes Admin Service Account"
}

# Allow GKE nodes to use the service account
resource "google_project_iam_member" "k8s_sa_role" {
  project = var.project_id
  role    = "roles/container.admin"
  member  = "serviceAccount:${google_service_account.k8s.email}"
}

# Kubernetes provider config (so you can apply K8s manifests with Terraform if you want)
provider "kubernetes" {
  host                   = google_container_cluster.primary.endpoint
  cluster_ca_certificate = base64decode(google_container_cluster.primary.master_auth[0].cluster_ca_certificate)
  token                  = data.google_client_config.default.access_token
}

data "google_client_config" "default" {}
