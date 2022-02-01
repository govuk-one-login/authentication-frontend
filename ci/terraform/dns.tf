data "terraform_remote_state" "dns" {
  count = var.account_management_fqdn == null && var.oidc_api_fqdn == null ? 1 : 0

  backend = "s3"
  config = {
    bucket   = var.dns_state_bucket
    key      = var.dns_state_key
    role_arn = var.dns_state_role
    region   = var.aws_region
  }
}

locals {
  account_management_fqdn = var.account_management_fqdn == null ? lookup(data.terraform_remote_state.dns[0].outputs, "${var.environment}_account_management_url", "") : var.account_management_fqdn
  frontend_fqdn           = var.frontend_fqdn == null ? lookup(data.terraform_remote_state.dns[0].outputs, "${var.environment}_frontend_url", "") : var.frontend_fqdn
  frontend_api_fqdn       = var.frontend_api_fqdn == null ? lookup(data.terraform_remote_state.dns[0].outputs, "${var.environment}_api_frontend_url", "") : var.frontend_api_fqdn
  oidc_api_fqdn           = var.oidc_api_fqdn == null ? lookup(data.terraform_remote_state.dns[0].outputs, "${var.environment}_api_url", "") : var.oidc_api_fqdn
  service_domain          = var.service_domain == null ? lookup(data.terraform_remote_state.dns[0].outputs, "${var.environment}_service_domain", "") : var.service_domain
  zone_id                 = var.zone_id == null ? lookup(data.terraform_remote_state.dns[0].outputs, "${var.environment}_zone_id", "") : var.zone_id
}