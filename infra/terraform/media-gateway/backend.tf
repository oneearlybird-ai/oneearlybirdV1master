terraform {
  backend "s3" {
    bucket         = "oneearlybird-tfstate-prod-102732512054-use1"
    key            = "media-gateway/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "oneearlybird-tf-locks"
    encrypt        = true
  }
}

