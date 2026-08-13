output "ecr_repository_url" {
  description = "URL du repository ECR"
  value       = aws_ecr_repository.backend.repository_url
}

output "ec2_instance_id" {
  description = "ID de l'instance EC2"
  value       = aws_instance.k3s.id
}

output "ec2_public_ip" {
  description = "IP publique de l'instance EC2"
  value       = aws_eip.k3s.public_ip
}

output "eip_id" {
  description = "ID de l'Elastic IP"
  value       = aws_eip.k3s.id
}
