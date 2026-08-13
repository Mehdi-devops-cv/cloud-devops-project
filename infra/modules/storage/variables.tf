variable "environment" {
  description = "Environnement (dev, staging, production)"
  type        = string
}

variable "project_name" {
  description = "Nom du projet"
  type        = string
}

variable "s3_bucket_prefix" {
  description = "Préfixe du nom du bucket S3"
  type        = string
}

variable "cloudfront_price_class" {
  description = "Classe de prix CloudFront"
  type        = string
}

variable "domain_name" {
  description = "Nom de domaine personnalisé (vide si pas de domaine)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags communs"
  type        = map(string)
}
