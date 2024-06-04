environment         = "production"
common_state_bucket = "digital-identity-prod-tfstate"
redis_node_size     = "cache.m4.xlarge"

frontend_auto_scaling_v2_enabled                    = true
frontend_task_definition_cpu                        = 512
frontend_task_definition_memory                     = 1024
frontend_auto_scaling_min_count                     = 4
frontend_auto_scaling_max_count                     = 240
ecs_desired_count                                   = 4
support_account_recovery                            = "1"
support_account_interventions                       = "1"
support_authorize_controller                        = "1"
support_2fa_b4_password_reset                       = "1"
support_2hr_lockout                                 = "1"
code_request_blocked_minutes                        = "120"
account_recovery_code_entered_wrong_blocked_minutes = "120"
code_entered_wrong_blocked_minutes                  = "120"
email_entered_wrong_blocked_minutes                 = "120"
password_reset_code_entered_wrong_blocked_minutes   = "120"
reduced_code_block_duration_minutes                 = "15"
language_toggle_enabled                             = "1"

url_for_support_links = "https://home.account.gov.uk/contact-gov-uk-one-login"

logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]

dynatrace_secret_arn = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceProductionVariables"

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE5iJXSuxgbfM6ADQVtNNDi7ED5ly5\n+3VZPbjHv+v0AjQ5Ps+avkXWKwOeScG9sS0cDf0utEXi3fN3cEraa9WuKQ==\n-----END PUBLIC KEY-----"
orch_to_auth_client_id          = "orchestrationAuth"
orch_to_auth_audience           = "https://signin.account.gov.uk/"

ua_disabled             = "false"
analytics_cookie_domain = "https://signin.account.gov.uk/"
