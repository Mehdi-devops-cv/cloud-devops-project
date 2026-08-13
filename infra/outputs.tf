output "vpc_id" {
  description = "ID du VPC"
  value       = module.network.vpc_id
}

output "public_subnet_ids" {
  description = "IDs des sous-réseaux publics"
  value       = module.network.public_subnet_ids
}

output "ec2_sg_id" {
  description = "ID du security group EC2"
  value       = module.network.ec2_sg_id
}

output "ecr_repository_url" {
  description = "URL du repository ECR"
  value       = module.compute.ecr_repository_url
}

output "ec2_instance_id" {
  description = "ID de l'instance EC2 K3s"
  value       = module.compute.ec2_instance_id
}

output "ec2_public_ip" {
  description = "IP publique de l'instance EC2 K3s"
  value       = module.compute.ec2_public_ip
}

output "s3_bucket_name" {
  description = "Nom du bucket S3 frontend"
  value       = module.storage.s3_bucket_name
}

output "cloudfront_domain_name" {
  description = "Nom de domaine CloudFront"
  value       = module.storage.cloudfront_domain_name
}

output "cloudfront_distribution_id" {
  description = "ID de la distribution CloudFront"
  value       = module.storage.cloudfront_distribution_id
}

output "jenkins_instance_profile" {
  description = "Nom du instance profile Jenkins"
  value       = module.iam.jenkins_instance_profile
}

output "jenkins_role_arn" {
  description = "ARN du rôle IAM Jenkins"
  value       = module.iam.jenkins_role_arn
}