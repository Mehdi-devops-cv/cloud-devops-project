output "name" {
  value = var.name
}

output "service_ip" {
  value = kubernetes_service.app.spec[0].cluster_ip
}
