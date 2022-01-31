data "aws_iam_policy_document" "cloudwatch" {
  policy_id = "key-policy-cloudwatch"
  statement {
    sid = "Enable IAM User Permissions for root user"
    actions = [
      "kms:*",
    ]
    effect = "Allow"
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
  statement {
    sid = "AllowCloudWatchLogs"
    actions = [
      "kms:Encrypt*",
      "kms:Decrypt*",
      "kms:Describe*"
    ]
    effect = "Allow"
    principals {
      type = "Service"
      identifiers = [
        format(
          "logs.%s.amazonaws.com",
          var.aws_region
        )
      ]
    }
    resources = ["*"]
  }
}

resource "aws_kms_key" "cloudwatch_log_encryption" {
  description             = "KMS key for Frontend ECS Cloudwatch logs"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  policy                  = data.aws_iam_policy_document.cloudwatch.json

  tags = local.default_tags
}

resource "aws_cloudwatch_log_group" "ecs_frontend_task_log" {
  name              = "${var.environment}-frontend-ecs-task"
  kms_key_id        = aws_kms_key.cloudwatch_log_encryption.arn
  retention_in_days = var.cloudwatch_log_retention

  tags = local.default_tags
}

resource "aws_cloudwatch_log_subscription_filter" "ecs_frontend_task_log_subscription" {
  count           = var.logging_endpoint_enabled ? 1 : 0
  name            = "${aws_cloudwatch_log_group.ecs_frontend_task_log.name}-splunk-subscription"
  log_group_name  = aws_cloudwatch_log_group.ecs_frontend_task_log.name
  filter_pattern  = ""
  destination_arn = var.logging_endpoint_arn
}
