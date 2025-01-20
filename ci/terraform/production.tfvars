environment         = "production"
common_state_bucket = "digital-identity-prod-tfstate"
redis_node_size     = "cache.m4.xlarge"
service_down_page   = true

# cloudfront enabled flag
cloudfront_auth_frontend_enabled = true
cloudfront_auth_dns_enabled      = true
cloudfront_WafAcl_Logdestination = "csls_cw_logs_destination_prodpython"

frontend_auto_scaling_v2_enabled                    = true
frontend_task_definition_cpu                        = 512
frontend_task_definition_memory                     = 1024
frontend_auto_scaling_min_count                     = 4
frontend_auto_scaling_max_count                     = 240
ecs_desired_count                                   = 4
support_account_recovery                            = "1"
support_account_interventions                       = "1"
support_authorize_controller                        = "1"
support_reauthentication                            = "1"
code_request_blocked_minutes                        = "120"
account_recovery_code_entered_wrong_blocked_minutes = "120"
code_entered_wrong_blocked_minutes                  = "120"
password_reset_code_entered_wrong_blocked_minutes   = "120"
reduced_code_block_duration_minutes                 = "15"
language_toggle_enabled                             = "1"
no_photo_id_contact_forms                           = "1"
support_new_ipv_spinner                             = "0"

url_for_support_links = "https://home.account.gov.uk/contact-gov-uk-one-login"

logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]

dynatrace_secret_arn = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceProductionVariables"

new_auth_account_id               = "211125303002"
new_auth_protectedsub_cidr_blocks = ["10.6.4.0/23", "10.6.6.0/23", "10.6.8.0/23"]

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE5iJXSuxgbfM6ADQVtNNDi7ED5ly5\n+3VZPbjHv+v0AjQ5Ps+avkXWKwOeScG9sS0cDf0utEXi3fN3cEraa9WuKQ==\n-----END PUBLIC KEY-----"
orch_to_auth_client_id          = "orchestrationAuth"
orch_to_auth_audience           = "https://signin.account.gov.uk/"

ua_enabled                           = "false"
universal_analytics_gtm_container_id = "GTM-TT5HDKV"
ga4_enabled                          = "true"
google_analytics_4_gtm_container_id  = "GTM-K4PBJH3"
analytics_cookie_domain              = ".account.gov.uk"
