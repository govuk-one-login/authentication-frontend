terraform {
  required_version = ">= 1.0.4"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.56.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.1.0"
    }
    cloudfoundry = {
      source  = "cloudfoundry-community/cloudfoundry"
      version = "0.14.2"
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

provider "cloudfoundry" {
  api_url      = "https://api.london.cloud.service.gov.uk"
  user         = var.cf_username
  password     = var.cf_password
  app_logs_max = 250
}

data "aws_availability_zones" "available" {}

locals {
  default_tags = {
    environment = var.environment
    application = "account-management"
  }
}