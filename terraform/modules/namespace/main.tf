resource "kubernetes_namespace" "appbtp" {
  metadata {
    name = "appbtp"
    labels = {
      app         = "appbtp"
      environment = "dev"
      managed-by  = "terraform"
    }
  }
}
