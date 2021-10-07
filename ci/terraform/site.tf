terraform {
  required_version = ">= 1.0.4"

  required_providers {
    cloudfoundry = {
      source  = "cloudfoundry-community/cloudfoundry"
      version = "0.14.2"
    }
  }

  backend "s3" {
  }
}

provider "cloudfoundry" {
  api_url      = "https://api.london.cloud.service.gov.uk"
  user         = var.cf_username
  password     = var.cf_password
  app_logs_max = 250
}
