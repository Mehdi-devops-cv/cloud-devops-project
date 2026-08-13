output "s3_bucket_name" {
  description = "Nom du bucket S3 frontend"
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_domain_name" {
  description = "Nom de domaine CloudFront"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_distribution_id" {
  description = "ID de la distribution CloudFront"
  value       = aws_cloudfront_distribution.frontend.id
}
