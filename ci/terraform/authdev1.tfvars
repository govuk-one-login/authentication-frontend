environment             = "authdev1"
common_state_bucket     = "di-auth-development-tfstate"
aws_region              = "eu-west-2"
account_management_fqdn = "acc-mgmt-fg.authdev1.sandpit.auth.ida.digital.cabinet-office.gov.uk"
oidc_api_fqdn           = "oidc.authdev1.sandpit.account.gov.uk"
frontend_fqdn           = "signin.authdev1.sandpit.account.gov.uk"
frontend_api_fqdn       = "auth.authdev1.sandpit.account.gov.uk"
service_domain          = "authdev1.sandpit.account.gov.uk"
zone_id                 = "Z062000928I8D7S9X1OVA"
session_expiry          = 300000
gtm_id                  = ""
redis_node_size         = "cache.t2.micro"
vpc_environment         = "dev"

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
support_new_ipv_spinner                             = "1"
support_mfa_reset_with_ipv                          = "1"

frontend_task_definition_cpu     = 512
frontend_task_definition_memory  = 1024
frontend_auto_scaling_v2_enabled = false # Auto scaling not enabled in Authdev2 as its sharing the Dev ecs cluster
# To enable Autoscaling in authdev2 we need to move the ecs Cluster creation from core repo to frontend repo
deployment_min_healthy_percent  = 100
deployment_max_percent          = 200
frontend_auto_scaling_min_count = 1
frontend_auto_scaling_max_count = 2
ecs_desired_count               = 1

# cloudfront flag
cloudfront_auth_frontend_enabled = true
cloudfront_auth_dns_enabled      = true

alb_idle_timeout = 30

new_auth_account_id               = "975050272416"
new_auth_protectedsub_cidr_blocks = ["10.6.4.0/23", "10.6.6.0/23", "10.6.8.0/23"]

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAENB3csRUIdoaTHNn079Jl7JpiXzxF\n0p2ZIddCErxtIhGMTTqtbQZJCPesSKUVE/DQbpIko3mLoisuFgmQfFouCw==\n-----END PUBLIC KEY-----"
orch_to_auth_client_id          = "orchestrationAuth"
orch_to_auth_audience           = "https://signin.authdev1.sandpit.account.gov.uk/"

orch_stub_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEM0ZehmrdDd89uYEFMTakbS7JgwCG\nXK7CAYMcVvy1pP5yV4O2mnDjYmvjZpvio2ctgOPxDuBb38QP1HD9WAOR2w==\n-----END PUBLIC KEY-----"
orch_stub_to_auth_client_id          = "orchestrationAuth"
orch_stub_to_auth_audience           = "https://signin.authdev1.sandpit.account.gov.uk/"

dynatrace_secret_arn = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceNonProductionVariables"

analytics_cookie_domain = ".authdev1.sandpit.account.gov.uk"
