provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "LINGO-Legacy"
      Component   = "G02-Recovery-Runner"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

data "aws_vpc" "selected" {
  id = var.vpc_id
}

data "aws_subnet" "selected" {
  id     = var.subnet_id
  vpc_id = data.aws_vpc.selected.id
}

data "aws_ami" "approved" {
  owners = ["099720109477"]

  filter {
    name   = "image-id"
    values = [var.ami_id]
  }
}

resource "aws_security_group" "runner" {
  name        = "lingo-g02-runner-${var.environment}"
  description = "Dedicated G02 runner; no inbound access."
  vpc_id      = data.aws_vpc.selected.id

  ingress = []

  egress {
    description = "Outbound connectivity; restrict or use approved egress proxy before production."
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = var.allowed_egress_cidrs
  }
}

resource "aws_iam_role" "runner" {
  name = "lingo-g02-runner-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.runner.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "runner" {
  name = "lingo-g02-runner-${var.environment}"
  role = aws_iam_role.runner.name
}

resource "aws_instance" "runner" {
  ami                         = data.aws_ami.approved.id
  instance_type               = var.instance_type
  subnet_id                   = data.aws_subnet.selected.id
  vpc_security_group_ids      = [aws_security_group.runner.id]
  iam_instance_profile        = aws_iam_instance_profile.runner.name
  associate_public_ip_address = false
  user_data                   = file("${path.module}/user-data.sh")

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  root_block_device {
    encrypted             = true
    volume_size           = var.root_volume_size_gib
    volume_type           = "gp3"
    delete_on_termination = true
  }

  monitoring = true

  tags = {
    Name = "lingo-g02-runner-${var.environment}"
    Role = "g02-recovery-runner"
  }

  lifecycle {
    prevent_destroy = true
  }
}

output "instance_id" {
  value = aws_instance.runner.id
}

output "private_ip" {
  value = aws_instance.runner.private_ip
}

output "security_group_id" {
  value = aws_security_group.runner.id
}
