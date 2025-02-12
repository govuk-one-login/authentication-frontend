environment         = "staging"
common_state_bucket = "di-auth-staging-tfstate"
redis_node_size     = "cache.m4.xlarge"

# cloudfront enabled flag
cloudfront_auth_frontend_enabled = true
cloudfront_auth_dns_enabled      = true
cloudfront_WafAcl_Logdestination = "csls_cw_logs_destination_prodpython"

frontend_auto_scaling_v2_enabled                    = true
frontend_task_definition_cpu                        = 2048
frontend_task_definition_memory                     = 4096
frontend_auto_scaling_min_count                     = 4
frontend_auto_scaling_max_count                     = 240
ecs_desired_count                                   = 4
support_account_recovery                            = "1"
support_account_interventions                       = "1"
support_authorize_controller                        = "1"
code_request_blocked_minutes                        = "120"
account_recovery_code_entered_wrong_blocked_minutes = "120"
code_entered_wrong_blocked_minutes                  = "120"
password_reset_code_entered_wrong_blocked_minutes   = "120"
reduced_code_block_duration_minutes                 = "15"
support_reauthentication                            = "1"
language_toggle_enabled                             = "1"
no_photo_id_contact_forms                           = "1"
support_new_ipv_spinner                             = "1"
support_http_keep_alive                             = "1"
support_mfa_reset_with_ipv                          = "1"

url_for_support_links = "https://home.staging.account.gov.uk/contact-gov-uk-one-login"

logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]

dynatrace_secret_arn = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceNonProductionVariables"

new_auth_account_id               = "851725205974"
new_auth_protectedsub_cidr_blocks = ["10.6.4.0/23", "10.6.6.0/23", "10.6.8.0/23"]

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE5PP1PZmhiuHR57ZEfZXARt9/uiG+\nKKF+S7us4zEEEmEXZFR1H+kWP5RrLHQy9esxsul9X7V4pygDTY1I6QbMGg==\n-----END PUBLIC KEY-----"
orch_to_auth_client_id          = "orchestrationAuth"
orch_to_auth_audience           = "https://signin.staging.account.gov.uk/"

ga4_enabled                         = "true"
google_analytics_4_gtm_container_id = "GTM-KD86CMZ"
analytics_cookie_domain             = ".staging.account.gov.uk"
