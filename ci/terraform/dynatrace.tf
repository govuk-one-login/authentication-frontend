data "aws_secretsmanager_secret" "dynatrace_secrets" {
  arn = var.environment == "production" ? "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceProductionVariables" : "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceNonProductionVariables"
}

data "aws_secretsmanager_secret_version" "dynatrace_secrets" {
  secret_id = data.aws_secretsmanager_secret.dynatrace_secrets.id
}