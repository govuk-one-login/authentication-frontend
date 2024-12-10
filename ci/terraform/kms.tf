resource "aws_kms_key" "authentication_encryption_key" {
  description              = "KMS encryption key for decrypting requests from Orchestration"
  deletion_window_in_days  = 30
  key_usage                = "ENCRYPT_DECRYPT"
  customer_master_key_spec = "RSA_2048"
}

resource "aws_kms_key_policy" "authentication_encryption_key_access_policy" {
  key_id = aws_kms_key.authentication_encryption_key.id
  policy = data.aws_iam_policy_document.authentication_encryption_key_access_policy_document.json
}

data "aws_iam_policy_document" "authentication_encryption_key_access_policy_document" {
  #checkov:skip=CKV_AWS_109:Root requires all kms:* actions access
  #checkov:skip=CKV_AWS_111:Root requires all kms:* actions access
  #checkov:skip=CKV_AWS_356:Policy cannot self-reference the kms key, so resources wildcard is required
  statement {
    sid    = "Enable IAM User Permissions"
    effect = "Allow"
    actions = [
      "kms:*"
    ]
    principals {
      type = "AWS"
      identifiers = [
        format(
          "arn:%s:iam::%s:root",
          data.aws_partition.current.partition,
          data.aws_caller_identity.current.account_id
        )
      ]
    }
    resources = ["*"]
  }

  dynamic "statement" {
    for_each = var.new_auth_account_id == "" ? [] : [1]

    content {
      sid    = "AllowAccessToAuthenticationKmsEncryptionKey"
      effect = "Allow"

      actions = [
        "kms:Decrypt*"
      ]
      principals {
        type = "AWS"
        identifiers = [
          format(
            "arn:%s:iam::%s:root",
            data.aws_partition.current.partition,
            var.new_auth_account_id
          )
        ]
      }
      resources = ["*"]
    }
  }
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
