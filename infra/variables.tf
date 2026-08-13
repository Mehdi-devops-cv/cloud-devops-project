variable "aws_region" {
  description = "Région AWS de déploiement"
  type        = string
  default     = "eu-west-3"
}

variable "environment" {
  description = "Environnement (dev, staging, production)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Nom du projet (préfixe des ressources)"
  type        = string
  default     = "appbtp"
}

variable "vpc_cidr" {
  description = "CIDR du VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDRs des sous-réseaux publics"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "availability_zones" {
  description = "Zones de disponibilité AWS"
  type        = list(string)
  default     = ["eu-west-3a", "eu-west-3b"]
}

variable "instance_type" {
  description = "Type d'instance EC2 pour K3s"
  type        = string
  default     = "t3.micro"
}

variable "allowed_ssh_cidrs" {
  description = "CIDRs autorisés pour SSH"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "ecr_repo_name" {
  description = "Nom du repository ECR"
  type        = string
  default     = "appbtp-backend"
}

variable "s3_bucket_prefix" {
  description = "Préfixe du nom du bucket S3 frontend"
  type        = string
  default     = "appbtp-frontend"
}

variable "cloudfront_price_class" {
  description = "Classe de prix CloudFront (PriceClass_100 = Europe/Amérique)"
  type        = string
  default     = "PriceClass_100"
}

variable "domain_name" {
  description = "Nom de domaine personnalisé (optionnel)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags communs appliqués à toutes les ressources"
  type        = map(string)
  default = {
    Project     = "ApplicationBTP"
    ManagedBy   = "Terraform"
  }
}