environment         = "staging"
common_state_bucket = "di-auth-staging-tfstate"
redis_node_size     = "cache.m4.xlarge"

frontend_auto_scaling_v2_enabled = true
frontend_task_definition_cpu     = 512
frontend_task_definition_memory  = 1024
frontend_auto_scaling_min_count  = 4
frontend_auto_scaling_max_count  = 120
ecs_desired_count                = 4
support_language_cy              = "1"
support_international_numbers    = "1"
support_account_recovery         = "1"
support_account_interventions    = "1"
support_auth_orch_split          = "1"
support_authorize_controller     = "1"
url_for_support_links            = "https://home.staging.account.gov.uk/contact-gov-uk-one-login"

logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]

dynatrace_secret_arn                     = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceNonProductionVariables"
frame_ancestors_form_actions_csp_headers = "1"

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE5PP1PZmhiuHR57ZEfZXARt9/uiG+\nKKF+S7us4zEEEmEXZFR1H+kWP5RrLHQy9esxsul9X7V4pygDTY1I6QbMGg==\n-----END PUBLIC KEY-----"
orch_to_auth_client_id          = "orchestrationAuth"
orch_to_auth_audience           = "https://signin.staging.account.gov.uk/"
