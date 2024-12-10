terraform {
  required_version = ">= 1.9.8"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.75.1"
    }
    random = {
      source  = "hashicorp/random"
      version = "= 3.6.0"
    }
  }

  backend "s3" {
  }
}

provider "aws" {
  region = var.aws_region

  assume_role {
    role_arn = var.deployer_role_arn
  }
}

provider "aws" {
  alias = "cloudfront"

  region = "us-east-1"

  assume_role {
    role_arn = var.deployer_role_arn
  }
}

data "aws_availability_zones" "available" {}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_partition" "current" {}

locals {
  default_tags = {
    environment = var.environment
    application = "auth-frontend"
  }
}
