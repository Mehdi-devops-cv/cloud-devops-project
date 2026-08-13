variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
  default     = "appbtp"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "appbtp"
}

// Secrets : pas de valeur par defaut, fournis via terraform.tfvars (ignore par Git)
// ou via des variables d'environnement TF_VAR_* dans le pipeline.
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
