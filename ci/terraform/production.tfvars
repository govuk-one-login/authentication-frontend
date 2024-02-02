environment         = "production"
common_state_bucket = "digital-identity-prod-tfstate"
redis_node_size     = "cache.m4.xlarge"

frontend_auto_scaling_enabled    = false
frontend_auto_scaling_v2_enabled = false
frontend_task_definition_cpu     = 1024
frontend_task_definition_memory  = 2048
frontend_auto_scaling_min_count  = 60
frontend_auto_scaling_max_count  = 60
ecs_desired_count                = 60
support_international_numbers    = "1"
support_account_recovery         = "1"
support_account_interventions    = "0"
support_auth_orch_split          = "1"
support_authorize_controller     = "1"
url_for_support_links            = "https://home.account.gov.uk/contact-gov-uk-one-login"

logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]

dynatrace_secret_arn                     = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceProductionVariables"
frame_ancestors_form_actions_csp_headers = "1"

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE5iJXSuxgbfM6ADQVtNNDi7ED5ly5\n+3VZPbjHv+v0AjQ5Ps+avkXWKwOeScG9sS0cDf0utEXi3fN3cEraa9WuKQ==\n-----END PUBLIC KEY-----"
orch_to_auth_client_id          = "orchestrationAuth"
orch_to_auth_audience           = "https://signin.account.gov.uk/"
