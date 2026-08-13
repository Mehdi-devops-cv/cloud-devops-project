variable "aws_region" {
  description = "Région AWS"
  type        = string
}

variable "environment" {
  description = "Environnement (dev, staging, production)"
  type        = string
}

variable "project_name" {
  description = "Nom du projet"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR du VPC"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "CIDRs des sous-réseaux publics"
  type        = list(string)
}

variable "availability_zones" {
  description = "Zones de disponibilité"
  type        = list(string)
}

variable "allowed_ssh_cidrs" {
  description = "CIDRs autorisés pour SSH"
  type        = list(string)
}

variable "tags" {
  description = "Tags communs"
  type        = map(string)
}