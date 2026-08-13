variable "name" {
  type = string
}

variable "image" {
  type = string
}

variable "port" {
  type = number
}

resource "kubernetes_deployment" "app" {
  metadata {
    name      = var.name
    namespace = "appbtp"
    labels = {
      app = var.name
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = var.name
      }
    }

    template {
      metadata {
        labels = {
          app = var.name
        }
      }

      spec {
        container {
          name  = var.name
          image = var.image

          port {
            container_port = var.port
          }

          resources {
            requests = {
              memory = "128Mi"
              cpu    = "100m"
            }
            limits = {
              memory = "512Mi"
              cpu    = "500m"
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "app" {
  metadata {
    name      = var.name
    namespace = "appbtp"
  }

  spec {
    selector = {
      app = var.name
    }

    port {
      port        = var.port
      target_port = var.port
    }

    type = "ClusterIP"
  }
}
