output "jenkins_instance_profile" {
  description = "Nom du instance profile Jenkins (pour EC2)"
  value       = aws_iam_instance_profile.jenkins.name
}

output "jenkins_role_arn" {
  description = "ARN du rôle IAM Jenkins"
  value       = aws_iam_role.jenkins.arn
}