data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-kernel-6.1-*"]
  }
}
resource "aws_key_pair" "k3s" {
  key_name   = "${var.project_name}-k3s-${var.environment}"
  public_key = file("~/.ssh/appbtp-k3s-dev.pub")
}
resource "aws_ecr_repository" "backend" {
  name                 = var.ecr_repo_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-ecr-${var.environment}"
  })
}

resource "aws_eip" "k3s" {
  domain = "vpc"
  instance = aws_instance.k3s.id

  tags = merge(var.tags, {
    Name = "${var.project_name}-eip-${var.environment}"
  })
}

resource "aws_instance" "k3s" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = var.security_group_ids
  key_name               = aws_key_pair.k3s.key_name
  iam_instance_profile   = var.instance_profile
  associate_public_ip_address = true

  user_data = <<-EOF
    #!/bin/bash
    # Swap 2 Go pour éviter l'OOM
    dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab

    # Install K3s
    curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
    curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
    chmod +x get_helm.sh
    ./get_helm.sh
  EOF

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-k3s-${var.environment}"
  })
}
