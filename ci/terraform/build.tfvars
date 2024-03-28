environment         = "build"
common_state_bucket = "digital-identity-dev-tfstate"

frontend_auto_scaling_v2_enabled = true

frontend_task_definition_cpu    = 512
frontend_task_definition_memory = 1024

alb_idle_timeout = 30

support_international_numbers                       = "1"
support_account_recovery                            = "1"
support_auth_orch_split                             = "1"
support_authorize_controller                        = "1"
support_account_interventions                       = "1"
support_reauthentication                            = "1"
support_2fa_b4_password_reset                       = "1"
password_reset_code_entered_wrong_blocked_minutes   = "2"
account_recovery_code_entered_wrong_blocked_minutes = "0.5"
code_request_blocked_minutes                        = "2"
email_entered_wrong_blocked_minutes                 = "2"
code_entered_wrong_blocked_minutes                  = "2"
url_for_support_links                               = "https://home.build.account.gov.uk/contact-gov-uk-one-login"


logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAENRdvNXHwk1TvrgFUsWXAE5oDTcPr\nCBp6HxbvYDLsqwNHiDFEzCwvbXKY2QQR/Rtel0o156CtU9k1lCZJGAsSIA==\n-----END PUBLIC KEY-----"
orch_to_auth_client_id          = "orchestrationAuth"
orch_to_auth_audience           = "https://signin.build.account.gov.uk/"

dynatrace_secret_arn                     = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceNonProductionVariables"
frame_ancestors_form_actions_csp_headers = "1"
