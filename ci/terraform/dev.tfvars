basic_auth_bypass_cidr_blocks = []
deployer_role_arn             = "arn:aws:iam::761723964695:role/deployer-role-pipeline-dev"
common_state_bucket           = "digital-identity-dev-tfstate"
incoming_traffic_cidr_blocks  = ["0.0.0.0/0"]
support_language_cy           = "1"
support_account_recovery      = "1"
support_international_numbers = "1"

logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]

dynatrace_secret_arn = "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceNonProductionVariables"
