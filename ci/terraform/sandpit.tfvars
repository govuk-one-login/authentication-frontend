environment             = "sandpit"
common_state_bucket     = "digital-identity-dev-tfstate"
aws_region              = "eu-west-2"
account_management_fqdn = "acc-mgmt-fg.sandpit.auth.ida.digital.cabinet-office.gov.uk"
oidc_api_fqdn           = "api.sandpit.auth.ida.digital.cabinet-office.gov.uk"
frontend_fqdn           = "signin.sandpit.auth.ida.digital.cabinet-office.gov.uk"
frontend_api_fqdn       = "auth.sandpit.auth.ida.digital.cabinet-office.gov.uk"
service_domain          = "sandpit.auth.ida.digital.cabinet-office.gov.uk"
zone_id                 = "Z050645231Q0HZAX6FT5W"
session_expiry          = 300000
gtm_id                  = ""
support_language_cy     = "1"
support_mfa_options     = "1"

support_international_numbers   = 0
frontend_task_definition_cpu    = 256
frontend_task_definition_memory = 512
frontend_auto_scaling_enabled   = true

logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]
