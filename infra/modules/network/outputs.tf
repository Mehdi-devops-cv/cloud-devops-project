output "vpc_id" {
  description = "ID du VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs des sous-réseaux publics"
  value       = aws_subnet.public[*].id
}

output "ec2_sg_id" {
  description = "ID du security group EC2"
  value       = aws_security_group.ec2.id
}