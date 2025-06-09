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

locals {
  provider_default_tags = {
    Environment = var.environment
    Owner       = "di-authentication@digital.cabinet-office.gov.uk"
    Product     = "GOV.UK Sign In"
    System      = "Authentication"
    Service     = "frontend"
    application = "auth-frontend"
  }
}

provider "aws" {
  region = var.aws_region

  dynamic "assume_role" {
    for_each = var.deployer_role_arn != null ? [var.deployer_role_arn] : []
    content {
      role_arn = assume_role.value
    }
  }

  default_tags {
    tags = local.provider_default_tags
  }
}

provider "aws" {
  alias = "cloudfront"

  region = "us-east-1"

  dynamic "assume_role" {
    for_each = var.deployer_role_arn != null ? [var.deployer_role_arn] : []
    content {
      role_arn = assume_role.value
    }
  }

  default_tags {
    tags = local.provider_default_tags
  }
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_partition" "current" {}
