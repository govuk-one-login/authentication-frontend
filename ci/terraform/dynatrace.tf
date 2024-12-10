data "aws_iam_policy_document" "dynatrace_policy" {
  statement {
    effect = "Allow"

    actions = [
      "secretsmanager:ListSecrets",
      "secretsmanager:GetSecretValue",
    ]

    resources = [
      "arn:aws:secretsmanager:eu-west-2:216552277552:secret:*"
    ]
  }
  statement {
    effect = "Allow"

    actions = [
      "kms:Decrypt",
    ]

    resources = [
      "arn:aws:kms:eu-west-2:216552277552:key/*"
    ]
  }
}

resource "aws_iam_policy" "dynatrace_policy" {
  policy      = data.aws_iam_policy_document.dynatrace_policy.json
  path        = "/${var.environment}/"
  name_prefix = "dynatrace-secret-policy"
}
