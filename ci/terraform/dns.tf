locals {
  service_domain          = var.service_domain == null ? "${var.environment}.account.gov.uk" : var.service_domain
  account_management_fqdn = local.service_domain
  frontend_fqdn           = "signin.${local.service_domain}"
  frontend_api_fqdn       = "auth.${local.service_domain}"
  oidc_api_fqdn           = "oidc.${local.service_domain}"
}

data "aws_route53_zone" "service_domain" {
  name = local.service_domain
}
