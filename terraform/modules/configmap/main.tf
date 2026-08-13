resource "kubernetes_config_map" "appbtp_config" {
  metadata {
    name      = "appbtp-config"
    namespace = "appbtp"
  }

  data = {
    "node-env"            = "development"
    "log-level"           = "debug"
    "prometheus-enabled"  = "true"
  }
}
