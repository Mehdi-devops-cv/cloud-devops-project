variable "environment" {
  description = "Environnement (dev, staging, production)"
  type        = string
}

variable "project_name" {
  description = "Nom du projet"
  type        = string
}

variable "ecr_repo_name" {
  description = "Nom du repository ECR"
  type        = string
}

variable "instance_type" {
  description = "Type d'instance EC2"
  type        = string
}

variable "subnet_id" {
  description = "ID du subnet où déployer l'EC2"
  type        = string
}

variable "security_group_ids" {
  description = "IDs des security groups"
  type        = list(string)
}

variable "instance_profile" {
  description = "Nom du instance profile IAM"
  type        = string
}

variable "tags" {
  description = "Tags communs"
  type        = map(string)
}
