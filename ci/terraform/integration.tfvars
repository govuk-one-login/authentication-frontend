environment         = "integration"
common_state_bucket = "digital-identity-dev-tfstate"

frontend_auto_scaling_enabled   = true
frontend_task_definition_cpu    = 512
frontend_task_definition_memory = 1024

support_welsh_language_in_support_forms                             = "1"
support_international_numbers                                       = "1"
support_language_cy                                                 = "1"
support_account_recovery                                            = "1"
support_smart_agent                                                 = "1"
client_name_that_directs_all_contact_form_submissions_to_smartagent = ""
url_for_support_links                                               = "https://home.integration.account.gov.uk/contact-gov-uk-one-login"

logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]
