terraform {
  required_version = ">= 1.5"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

module "namespace" {
  source = "./modules/namespace"
}

module "configmap" {
  source     = "./modules/configmap"
  depends_on = [module.namespace]
}

module "secrets" {
  source = "./modules/secret"

  namespace           = var.namespace
  mongodb_uri         = var.mongodb_uri
  jwt_secret          = var.jwt_secret
  rabbitmq_url        = var.rabbitmq_url
  mongo_root_user     = var.mongo_root_user
  mongo_root_password = var.mongo_root_password

  depends_on = [module.namespace]
}

module "mongodb" {
  source     = "./modules/deployment"
  name       = "mongodb"
  image      = "mongo:7"
  port       = 27017
  depends_on = [module.namespace, module.secrets]
}

module "rabbitmq" {
  source     = "./modules/deployment"
  name       = "rabbitmq"
  image      = "rabbitmq:3-management"
  port       = 5672
  depends_on = [module.namespace]
}

module "backend" {
  source     = "./modules/deployment"
  name       = "backend"
  image      = "appbtp-backend:latest"
  port       = 8081
  depends_on = [module.namespace, module.secrets, module.mongodb, module.rabbitmq]
}

module "worker" {
  source     = "./modules/deployment"
  name       = "worker"
  image      = "appbtp-worker:latest"
  port       = 9090
  depends_on = [module.namespace, module.secrets, module.mongodb, module.rabbitmq]
}
