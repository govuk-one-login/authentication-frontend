environment                   = "authdev2"
common_state_bucket           = "di-auth-development-tfstate"
aws_region                    = "eu-west-2"
account_management_fqdn       = "acc-mgmt-fg.authdev2.sandpit.auth.ida.digital.cabinet-office.gov.uk"
oidc_api_fqdn                 = "oidc.authdev2.sandpit.account.gov.uk"
frontend_fqdn                 = "signin.authdev2.sandpit.account.gov.uk"
frontend_api_fqdn             = "auth.authdev2.sandpit.account.gov.uk"
service_domain                = "authdev2.sandpit.account.gov.uk"
zone_id                       = "Z062000928I8D7S9X1OVA"
session_expiry                = 300000
gtm_id                        = ""
support_account_recovery      = "1"
support_authorize_controller  = "1"
support_2fa_b4_password_reset = "1"

frontend_task_definition_cpu     = 512
frontend_task_definition_memory  = 1024
frontend_auto_scaling_v2_enabled = true
deployment_min_healthy_percent   = 100
deployment_max_percent           = 200
frontend_auto_scaling_min_count  = 1
frontend_auto_scaling_max_count  = 2
ecs_desired_count                = 1

GA4_DISABLED=false
UA_DISABLED=true
UNIVERSAL_ANALYTICS_GTM_CONTAINER_ID="GTM-TK92W68"
GOOGLE_ANALYTICS_4_GTM_CONTAINER_ID="GTM-KD86CMZ"
ANALYTICS_COOKIE_DOMAIN="localhost"

alb_idle_timeout = 30

url_for_support_links = "https://home.build.account.gov.uk/contact-gov-uk-one-login"

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE/Yz722IDLN1mPqkPTihkwAkp/rUm\nBhnWynwAkE/YZlskX+N7VmwIjupla7O6hczlIOqkmPdQ1ayDqI8yY2QOiw==\n-----END PUBLIC KEY-----"
orch_to_auth_client_id          = "orchestrationAuth"
orch_to_auth_audience           = "https://signin.authdev2.sandpit.account.gov.uk/"


dynatrace_secret_arn = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceNonProductionVariables"
