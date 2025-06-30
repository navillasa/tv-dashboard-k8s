output "cluster_name" {
  value = google_container_cluster.primary.name
}

output "kubeconfig" {
  value = <<EOT
apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: ${google_container_cluster.primary.master_auth[0].cluster_ca_certificate}
    server: https://${google_container_cluster.primary.endpoint}
  name: gke_${var.project_id}_${var.zone}_${var.cluster_name}
contexts:
- context:
    cluster: gke_${var.project_id}_${var.zone}_${var.cluster_name}
    user: gke_${var.project_id}_${var.zone}_${var.cluster_name}
  name: gke_${var.project_id}_${var.zone}_${var.cluster_name}
current-context: gke_${var.project_id}_${var.zone}_${var.cluster_name}
users:
- name: gke_${var.project_id}_${var.zone}_${var.cluster_name}
  user:
    auth-provider:
      name: gcp
EOT
  sensitive = true
}
