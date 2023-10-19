data "aws_secretsmanager_secret" "dynatrace_secrets" {
  arn = var.environment == "production" ? "DynatraceProductionVariables-2i9U2A" : ":DynatraceNonProductionVariables-XuMvaO"
}

data "aws_secretsmanager_secret_version" "dynatrace_secrets" {
  secret_id = data.aws_secretsmanager_secret.dynatrace_secrets.id
}


# data "aws_iam_policy_document" "dynatrace_permissions" {
#   statement {
#     sid    = "AllowGetSecret"
#     effect = "Allow"

#     actions = [
#       "secretsmanager:GetSecretValue",
#     ]

#     resources = [
#       "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceNonProductionVariables",
#       "arn:aws:secretsmanager:eu-west-2:216552277552:secret:DynatraceProductionVariables"
#     ]
#   }

#   statement {
#     sid    = "AllowListSecrets"
#     effect = "Allow"

#     actions = [
#       "secretsmanager:ListSecrets",
#     ]

#     resources = [
#       "arn:aws:secretsmanager:eu-west-2:216552277552:secret:*"
#     ]
#   }

#   statement {
#     sid    = "AllowKmsDecrypt"
#     effect = "Allow"

#     actions = [
#       "kms:Decrypt",
#     ]

#     resources = [
#       "arn:aws:kms:eu-west-2:216552277552:key/*"
#     ]
#   }
# }

# resource "aws_iam_policy" "dynatrace_permissions" {
#   policy      = data.aws_iam_policy_document.dynatrace_permissions.json
#   path        = "/${var.environment}/dynatrace/"
#   name_prefix = "dynatrace_observabilty"

#   tags = local.default_tags
# }
