// Aucune valeur par defaut : les secrets sont fournis a l'execution
// (terraform.tfvars local, ignore par Git, ou variables TF_VAR_* du pipeline).
// Le provider Kubernetes encode lui-meme en base64 : ne pas appeler base64encode ici.
resource "kubernetes_secret" "appbtp_secrets" {
  metadata {
    name      = "appbtp-secrets"
    namespace = var.namespace
  }

  type = "Opaque"

  data = {
    "mongodb-uri"         = var.mongodb_uri
    "jwt-secret"          = var.jwt_secret
    "rabbitmq-url"        = var.rabbitmq_url
    "mongo-root-user"     = var.mongo_root_user
    "mongo-root-password" = var.mongo_root_password
  }
}
