terraform {
  required_version = ">= 1.7.1"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 5.34.0"
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

data "aws_availability_zones" "available" {}

data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

locals {
  default_tags = {
    environment = var.environment
    application = "auth-frontend"
  }
}
