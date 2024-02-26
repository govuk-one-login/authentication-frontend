environment                   = "authdev1"
common_state_bucket           = "di-auth-development-tfstate"
aws_region                    = "eu-west-2"
account_management_fqdn       = "acc-mgmt-fg.authdev1.sandpit.auth.ida.digital.cabinet-office.gov.uk"
oidc_api_fqdn                 = "oidc.authdev1.sandpit.account.gov.uk"
frontend_fqdn                 = "signin.authdev1.sandpit.account.gov.uk"
frontend_api_fqdn             = "auth.authdev1.sandpit.account.gov.uk"
service_domain                = "authdev1.sandpit.account.gov.uk"
zone_id                       = "Z062000928I8D7S9X1OVA"
session_expiry                = 300000
gtm_id                        = ""
support_language_cy           = "1"
support_account_recovery      = "1"
support_auth_orch_split       = "1"
support_authorize_controller  = "1"
support_international_numbers = "1"
support_account_interventions = "1"

frontend_task_definition_cpu     = 256
frontend_task_definition_memory  = 512
frontend_auto_scaling_v2_enabled = true

url_for_support_links = "https://home.build.account.gov.uk/contact-gov-uk-one-login"

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAESyWJU5s5F4jSovHsh9y133/Ogf5P\nx78OrfDJqiMMI2p8Warbq0ppcbWvbihK6rAXTH7bPIeOHOeU9cKAEl5NdQ==\n-----END PUBLIC KEY-----"
orch_to_auth_client_id          = "orchestrationAuth"
orch_to_auth_audience           = "https://signin.authdev1.sandpit.account.gov.uk/"


frame_ancestors_form_actions_csp_headers = "1"

dynatrace_secret_arn = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceNonProductionVariables"
