data "aws_secretsmanager_secret" "dynatrace_paas_token" {
  name = "DynatracePaaSToken"
}

data "aws_iam_policy_document" "dynatrace_paas_token" {
  statement {
    sid    = "AllowGetSecret"
    effect = "Allow"

    actions = [
      "secretsmanager:GetSecretValue",
    ]

    resources = [
      data.aws_secretsmanager_secret.dynatrace_paas_token.arn,
    ]
  }
}

resource "aws_iam_policy" "dynatrace_paas_token" {
  policy      = data.aws_iam_policy_document.dynatrace_paas_token.json
  path        = "/${var.environment}/secretsmanager/dynatrace_paas_token/"
  name_prefix = "dynatrace_paas_token"

  tags = local.default_tags
}
