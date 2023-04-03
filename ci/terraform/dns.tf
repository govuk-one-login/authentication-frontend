data "terraform_remote_state" "dns" {
  count = var.zone_id == null ? 1 : 0

  backend = "s3"
  config = {
    bucket   = var.dns_state_bucket
    key      = var.dns_state_key
    role_arn = var.dns_state_role
    region   = var.aws_region
  }
}

locals {
  service_domain          = var.service_domain == null ? "${var.environment}.account.gov.uk" : var.service_domain
  account_management_fqdn = local.service_domain
  frontend_fqdn           = "signin.${local.service_domain}"
  frontend_api_fqdn       = "auth.${local.service_domain}"
  oidc_api_fqdn           = "oidc.${local.service_domain}"
  zone_id                 = var.zone_id == null ? lookup(data.terraform_remote_state.dns[0].outputs, "${var.environment}_zone_id", "") : var.zone_id
}
