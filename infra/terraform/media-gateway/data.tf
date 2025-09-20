data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Use the default VPC for now (keeps cost down, no NAT)
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default_vpc" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Debian 12 ARM64 AMI (owner: Debian, arm64)
data "aws_ami" "debian12_arm64" {
  most_recent = true
  owners      = ["136693071363"] # Debian
  filter {
    name   = "name"
    values = ["debian-12-arm64-*"]
  }
  filter {
    name   = "architecture"
    values = ["arm64"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

# Hosted zone for the domain apex
locals {
  domain_parts = split(".", var.domain_name)
  apex         = join(".", slice(local.domain_parts, length(local.domain_parts) - 2, length(local.domain_parts)))
}

data "aws_route53_zone" "zone" {
  zone_id      = var.hosted_zone_id
  private_zone = false
}
