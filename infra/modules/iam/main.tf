# Rôle IAM pour Jenkins (EC2)
resource "aws_iam_role" "jenkins" {
  name = "${var.project_name}-jenkins-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.project_name}-jenkins-role-${var.environment}"
  })
}

# Politique : push ECR
resource "aws_iam_role_policy" "jenkins_ecr" {
  name = "${var.project_name}-jenkins-ecr-${var.environment}"
  role = aws_iam_role.jenkins.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:GetRepositoryPolicy",
          "ecr:DescribeRepositories",
          "ecr:ListImages",
          "ecr:DescribeImages",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Resource = "*"
      }
    ]
  })
}

# Politique : sync S3 + CloudFront invalidation
resource "aws_iam_role_policy" "jenkins_frontend" {
  name = "${var.project_name}-jenkins-frontend-${var.environment}"
  role = aws_iam_role.jenkins.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "arn:aws:s3:::${var.project_name}-frontend-*",
          "arn:aws:s3:::${var.project_name}-frontend-*/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation"
        ]
        Resource = "*"
      }
    ]
  })
}

# Politique : SSM (debug)
resource "aws_iam_role_policy" "jenkins_ssm" {
  name = "${var.project_name}-jenkins-ssm-${var.environment}"
  role = aws_iam_role.jenkins.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:UpdateInstanceInformation",
          "ec2messages:*"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "jenkins_repos" {
  name = "${var.project_name}-jenkins-repos-${var.environment}"
  role = aws_iam_role.jenkins.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "s3:GetObject"
        Resource = "arn:aws:s3:::al2023-repos-*"
      }
    ]
  })
}

# Instance Profile (lien entre EC2 et le rôle IAM)
resource "aws_iam_instance_profile" "jenkins" {
  name = "${var.project_name}-jenkins-profile-${var.environment}"
  role = aws_iam_role.jenkins.name

  tags = merge(var.tags, {
    Name = "${var.project_name}-jenkins-profile-${var.environment}"
  })
}