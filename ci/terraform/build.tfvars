environment         = "build"
common_state_bucket = "digital-identity-dev-tfstate"

frontend_auto_scaling_v2_enabled = true

frontend_task_definition_cpu    = 512
frontend_task_definition_memory = 1024
frontend_auto_scaling_min_count = 4
frontend_auto_scaling_max_count = 6
ecs_desired_count               = 4

alb_idle_timeout = 30

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
use_rebrand                                         = "1"
show_wallet_contact_form                            = "1"


logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]

new_auth_account_id               = "058264536367"
new_auth_protectedsub_cidr_blocks = ["10.6.4.0/23", "10.6.6.0/23", "10.6.8.0/23"]

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAENRdvNXHwk1TvrgFUsWXAE5oDTcPr\nCBp6HxbvYDLsqwNHiDFEzCwvbXKY2QQR/Rtel0o156CtU9k1lCZJGAsSIA==\n-----END PUBLIC KEY-----"
orch_to_auth_client_id          = "orchestrationAuth"
orch_to_auth_audience           = "https://signin.build.account.gov.uk/"

dynatrace_secret_arn = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceNonProductionVariables"


# cloudfront enabled flag
cloudfront_auth_frontend_enabled = true
cloudfront_auth_dns_enabled      = true
cloudfront_WafAcl_Logdestination = "csls_cw_logs_destination_prodpython"

analytics_cookie_domain = ".build.account.gov.uk"
