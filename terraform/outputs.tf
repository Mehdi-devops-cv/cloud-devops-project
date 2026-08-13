output "namespace" {
  value = module.namespace.name
}

output "backend_service" {
  value = "http://localhost:30081"
}

output "grafana_url" {
  value = "http://localhost:30300"
}

output "prometheus_url" {
  value = "http://localhost:30090"
}
