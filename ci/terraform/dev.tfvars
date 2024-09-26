environment         = "dev"
common_state_bucket = "di-auth-development-tfstate"

frontend_task_definition_cpu     = 512
frontend_task_definition_memory  = 1024
frontend_auto_scaling_v2_enabled = true
deployment_min_healthy_percent   = 100
deployment_max_percent           = 200
frontend_auto_scaling_min_count  = 1
frontend_auto_scaling_max_count  = 2
ecs_desired_count                = 1

alb_idle_timeout = 30

# cloudfront flag
cloudfront_auth_frontend_enabled = true
cloudfront_auth_dns_enabled      = true

support_account_recovery                            = "1"
support_authorize_controller                        = "1"
support_account_interventions                       = "1"
support_reauthentication                            = "1"
support_2fa_b4_password_reset                       = "1"
support_2hr_lockout                                 = "1"
password_reset_code_entered_wrong_blocked_minutes   = "1"
account_recovery_code_entered_wrong_blocked_minutes = "1"
code_request_blocked_minutes                        = "1"
email_entered_wrong_blocked_minutes                 = "1"
code_entered_wrong_blocked_minutes                  = "1"
reduced_code_block_duration_minutes                 = "0.5"
url_for_support_links                               = "https://home.dev.account.gov.uk/contact-gov-uk-one-login"
language_toggle_enabled                             = "1"
no_photo_id_contact_forms                           = "1"

logging_endpoint_arns = []

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE1P2vcnCdqx+MDwMTrJy47tV5ryTf\nkRaZYTpLsfCpC79ZgKSYEBcguuOUP4DvJpyHomBEnxeUs7s5KRgyMQjY4g==\n-----END PUBLIC KEY-----"
orch_to_auth_client_id          = "orchestrationAuth"
orch_to_auth_audience           = "https://signin.dev.account.gov.uk/"

dynatrace_secret_arn = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceNonProductionVariables"
