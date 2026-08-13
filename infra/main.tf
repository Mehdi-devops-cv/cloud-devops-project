module "network" {
  source = "./modules/network"

  aws_region          = var.aws_region
  environment         = var.environment
  project_name        = var.project_name
  vpc_cidr            = var.vpc_cidr
  public_subnet_cidrs = var.public_subnet_cidrs
  availability_zones  = var.availability_zones
  allowed_ssh_cidrs   = var.allowed_ssh_cidrs
  tags                = var.tags
}

module "iam" {
  source = "./modules/iam"

  environment  = var.environment
  project_name = var.project_name
  tags         = var.tags
}

module "compute" {
  source = "./modules/compute"

  environment         = var.environment
  project_name        = var.project_name
  ecr_repo_name       = var.ecr_repo_name
  instance_type       = var.instance_type
  subnet_id           = module.network.public_subnet_ids[0]
  security_group_ids  = [module.network.ec2_sg_id]
  instance_profile    = module.iam.jenkins_instance_profile
  tags                = var.tags
}

module "storage" {
  source = "./modules/storage"

  environment            = var.environment
  project_name           = var.project_name
  s3_bucket_prefix       = var.s3_bucket_prefix
  cloudfront_price_class = var.cloudfront_price_class
  domain_name            = var.domain_name
  tags                   = var.tags
}