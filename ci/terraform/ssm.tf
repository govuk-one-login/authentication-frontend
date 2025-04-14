locals {
  redis_key = "frontend-cache"
}

data "aws_ssm_parameter" "redis_master_host" {
  name = "${var.environment}-${local.redis_key}-redis-master-host"
}

data "aws_ssm_parameter" "redis_replica_host" {
  name = "${var.environment}-${local.redis_key}-redis-replica-host"
}

data "aws_ssm_parameter" "redis_tls" {
  name = "${var.environment}-${local.redis_key}-redis-tls"
}

data "aws_ssm_parameter" "redis_password" {
  name = "${var.environment}-${local.redis_key}-redis-password"
}

data "aws_ssm_parameter" "redis_port" {
  name = "${var.environment}-${local.redis_key}-redis-port"
}

data "aws_kms_key" "parameter_store_key" {
  key_id = "alias/${var.environment}-frontend-cache-parameter-store-encryption-key"
}

data "aws_kms_alias" "parameter_store_key_alias" {
  name = "alias/${var.environment}-frontend-cache-parameter-store-encryption-key"
}

data "aws_iam_policy_document" "redis_parameter_policy" {
  statement {
    sid    = "AllowGetParameters"
    effect = "Allow"

    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
    ]

    resources = [
      data.aws_ssm_parameter.redis_master_host.arn,
      data.aws_ssm_parameter.redis_replica_host.arn,
      data.aws_ssm_parameter.redis_tls.arn,
      data.aws_ssm_parameter.redis_password.arn,
      data.aws_ssm_parameter.redis_port.arn,
    ]
  }
  statement {
    sid    = "AllowDecryptOfParameters"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
    ]

    resources = [
      data.aws_kms_alias.parameter_store_key_alias.arn,
      data.aws_kms_key.parameter_store_key.arn
    ]
  }
}

resource "aws_iam_policy" "parameter_policy" {
  policy      = data.aws_iam_policy_document.redis_parameter_policy.json
  path        = "/${var.environment}/redis/${local.redis_key}/"
  name_prefix = "parameter-store-policy"
}
