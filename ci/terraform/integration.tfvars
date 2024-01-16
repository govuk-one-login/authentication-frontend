environment         = "integration"
common_state_bucket = "digital-identity-dev-tfstate"

frontend_auto_scaling_enabled   = true
frontend_task_definition_cpu    = 512
frontend_task_definition_memory = 1024

support_international_numbers                                       = "1"
support_language_cy                                                 = "1"
support_account_recovery                                            = "1"
support_account_interventions                                       = "0"
support_auth_orch_split                                             = "1"
support_authorize_controller                                        = "1"
client_name_that_directs_all_contact_form_submissions_to_smartagent = ""
url_for_support_links                                               = "https://home.integration.account.gov.uk/contact-gov-uk-one-login"

logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]

dynatrace_secret_arn                     = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceNonProductionVariables"
frame_ancestors_form_actions_csp_headers = "1"

orch_to_auth_signing_public_key = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEzzwKLypUL89WVaeTbfBZu0Fws8T7\nppx89XLVfgXIoCs2P//N5qdghvzgNIgVehQ7CkzyorO/lnRlWPfjCG4Oxw==\n-----END PUBLIC KEY-----"
orch_to_auth_client_id          = "orchestrationAuth"
orch_to_auth_audience           = "https://signin.integration.account.gov.uk/"
