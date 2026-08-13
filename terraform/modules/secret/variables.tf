variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
  default     = "appbtp"
}

variable "mongodb_uri" {
  description = "URI de connexion MongoDB"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Cle de signature des JWT"
  type        = string
  sensitive   = true
}

variable "rabbitmq_url" {
  description = "URL de connexion RabbitMQ"
  type        = string
  sensitive   = true
}

variable "mongo_root_user" {
  description = "Utilisateur root MongoDB"
  type        = string
  sensitive   = true
}

variable "mongo_root_password" {
  description = "Mot de passe root MongoDB"
  type        = string
  sensitive   = true
}
