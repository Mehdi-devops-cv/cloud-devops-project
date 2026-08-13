output "name" {
  value = kubernetes_namespace.appbtp.metadata[0].name
}
