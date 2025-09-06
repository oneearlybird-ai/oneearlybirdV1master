variable "aws_region" { type = string }
variable "project" { type = string }
provider "aws" { region = var.aws_region }
