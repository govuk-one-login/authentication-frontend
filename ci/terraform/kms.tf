resource "aws_kms_key" "authentication_encryption_key" {
  description              = "KMS encryption key for decrypting requests from Orchestration"
  deletion_window_in_days  = 30
  key_usage                = "ENCRYPT_DECRYPT"
  customer_master_key_spec = "RSA_2048"

  tags = local.default_tags
}

resource "aws_kms_alias" "authentication_encryption_key_alias" {
  name          = "alias/${var.environment}-authentication-encryption-key-alias"
  target_key_id = aws_kms_key.authentication_encryption_key.key_id
}

data "aws_iam_policy_document" "authentication_encryption_key_policy_document" {
  statement {
    sid    = "AllowAccessToAuthenticationKmsEncryptionKey"
    effect = "Allow"

    actions = [
      "kms:Decrypt*"
    ]
    resources = [
      aws_kms_key.authentication_encryption_key.arn,
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
