environment         = "sandpit"
common_state_bucket = "digital-identity-dev-tfstate"
aws_region          = "eu-west-2"
session_expiry      = 300000

support_account_recovery                            = "1"
support_authorize_controller                        = "1"
support_account_interventions                       = "1"
support_reauthentication                            = "1"
password_reset_code_entered_wrong_blocked_minutes   = "1"
account_recovery_code_entered_wrong_blocked_minutes = "1"
code_request_blocked_minutes                        = "1"
code_entered_wrong_blocked_minutes                  = "1"
reduced_code_block_duration_minutes                 = "0.5"
url_for_support_links                               = "https://home.build.account.gov.uk/contact-gov-uk-one-login"
language_toggle_enabled                             = "1"
no_photo_id_contact_forms                           = "1"
support_new_ipv_spinner                             = "0"

frontend_task_definition_cpu     = 512
frontend_task_definition_memory  = 1024
frontend_auto_scaling_v2_enabled = true
deployment_min_healthy_percent   = 100
deployment_max_percent           = 200
frontend_auto_scaling_min_count  = 1
frontend_auto_scaling_max_count  = 2
ecs_desired_count                = 1

alb_idle_timeout = 30

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAESyWJU5s5F4jSovHsh9y133/Ogf5P\nx78OrfDJqiMMI2p8Warbq0ppcbWvbihK6rAXTH7bPIeOHOeU9cKAEl5NdQ==\n-----END PUBLIC KEY-----"
orch_to_auth_client_id          = "orchestrationAuth"
orch_to_auth_audience           = "https://signin.sandpit.account.gov.uk/"

logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]

dynatrace_secret_arn = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceNonProductionVariables"

analytics_cookie_domain = ".sandpit.account.gov.uk"
