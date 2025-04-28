
data "aws_kms_key" "authentication_encryption_key" {
  key_id = "alias/${var.environment}-authentication-encryption-key-alias"
}

data "aws_iam_policy_document" "authentication_encryption_key_policy_document" {
  statement {
    sid    = "AllowAccessToAuthenticationKmsEncryptionKey"
    effect = "Allow"

    actions = [
      "kms:Decrypt*"
    ]
    resources = [
      data.aws_kms_key.authentication_encryption_key.arn,
    ]
  }
}

resource "aws_iam_policy" "authentication_encryption_kms_policy" {
  name        = "${var.environment}-authentication-encryption-key-kms-policy"
  path        = "/${var.environment}/kms/"
  description = "IAM policy for managing KMS connection for Authentication encryption key"

  policy = data.aws_iam_policy_document.authentication_encryption_key_policy_document.json
}

resource "aws_iam_role_policy_attachment" "authentication_encryption_kms_policy" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.authentication_encryption_kms_policy.arn
}
