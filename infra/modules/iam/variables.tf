variable "environment" {
  description = "Environnement (dev, staging, production)"
  type        = string
}

variable "project_name" {
  description = "Nom du projet"
  type        = string
}

variable "tags" {
  description = "Tags communs"
  type        = map(string)
}