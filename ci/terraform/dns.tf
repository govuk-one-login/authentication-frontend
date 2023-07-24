locals {
  service_domain          = var.environment == "production" ? "account.gov.uk" : "${var.environment}.account.gov.uk"
  account_management_fqdn = var.environment == "production" ? "home.account.gov.uk" : "home.${var.environment}.account.gov.uk"
  frontend_fqdn           = "signin.${local.service_domain}"
  frontend_api_fqdn       = "auth.${local.service_domain}"
  oidc_api_fqdn           = "oidc.${local.service_domain}"
}

data "aws_route53_zone" "service_domain" {
  name = local.service_domain
}
