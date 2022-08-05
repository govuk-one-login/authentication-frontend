environment         = "production"
common_state_bucket = "digital-identity-prod-tfstate"
ecs_desired_count   = 4
redis_node_size     = "cache.m4.xlarge"

logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prod",
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]