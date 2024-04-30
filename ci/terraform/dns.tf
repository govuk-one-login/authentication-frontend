#Otheenv are Dev,build,Integration & Staging

locals {
  prod           = var.environment == "production" ? "account.gov.uk" : ""
  sandpitdevs    = var.environment == "authdev1" || var.environment == "authdev2" ? "${var.environment}.sandpit.account.gov.uk" : ""
  otherenv       = var.environment != "production" && var.environment != "authdev1" && var.environment != "authdev2" ? "${var.environment}.account.gov.uk" : ""
  service_domain = coalesce(local.prod, local.sandpitdevs, local.otherenv)

  account_management_fqdn = var.environment == "production" ? "home.account.gov.uk" : "home.${var.environment}.account.gov.uk"

  frontend_fqdn        = "signin.${local.service_domain}"
  frontend_api_fqdn    = "auth.${local.service_domain}"
  oidc_api_fqdn        = "oidc.${local.service_domain}"
  frontend_fqdn_origin = "origin.signin.${local.service_domain}"
}

data "aws_route53_zone" "service_domain" {
  name = local.service_domain
}
