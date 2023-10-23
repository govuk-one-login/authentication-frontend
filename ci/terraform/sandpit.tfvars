environment                   = "sandpit"
common_state_bucket           = "digital-identity-dev-tfstate"
aws_region                    = "eu-west-2"
account_management_fqdn       = "acc-mgmt-fg.sandpit.auth.ida.digital.cabinet-office.gov.uk"
oidc_api_fqdn                 = "oidc.sandpit.account.gov.uk"
frontend_fqdn                 = "signin.sandpit.account.gov.uk"
frontend_api_fqdn             = "auth.sandpit.account.gov.uk"
service_domain                = "sandpit.account.gov.uk"
zone_id                       = "Z1031735QZMC84WYW1TP"
session_expiry                = 300000
gtm_id                        = ""
support_language_cy           = "1"
support_account_recovery      = "1"
support_auth_orch_split       = "1"
support_international_numbers = "1"

frontend_task_definition_cpu    = 256
frontend_task_definition_memory = 512
frontend_auto_scaling_enabled   = true

support_smart_agent                     = "1"
support_welsh_language_in_support_forms = "1"
url_for_support_links                   = "https://home.build.account.gov.uk/contact-gov-uk-one-login"

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAESyWJU5s5F4jSovHsh9y133/Ogf5P\nx78OrfDJqiMMI2p8Warbq0ppcbWvbihK6rAXTH7bPIeOHOeU9cKAEl5NdQ==\n-----END PUBLIC KEY-----"

logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]
