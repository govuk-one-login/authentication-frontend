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
      "kms:Describe*",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
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
}

resource "aws_cloudwatch_log_group" "ecs_frontend_task_log" {
  name              = "/ecs/${var.environment}-frontend"
  kms_key_id        = aws_kms_key.cloudwatch_log_encryption.arn
  retention_in_days = var.cloudwatch_log_retention
}

resource "aws_cloudwatch_log_subscription_filter" "ecs_frontend_task_log_subscription" {
  count           = length(var.logging_endpoint_arns)
  name            = "${aws_cloudwatch_log_group.ecs_frontend_task_log.name}-splunk-subscription-${count.index}"
  log_group_name  = aws_cloudwatch_log_group.ecs_frontend_task_log.name
  filter_pattern  = ""
  destination_arn = var.logging_endpoint_arns[count.index]

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_cloudwatch_log_metric_filter" "get_requests_filter" {
  name           = "${var.environment}-all-get-requests-with-language-dimension"
  pattern        = "{$.req.method = \"GET\" && $.req.url != \"/healthcheck/\"}"
  log_group_name = aws_cloudwatch_log_group.ecs_frontend_task_log.name

  metric_transformation {
    name      = "${var.environment}-all-get-requests-with-language-dimension"
    namespace = "Authentication"
    dimensions = {
      language = "$.res.languageFromCookie"
    }
    value = "1"
  }
}

resource "aws_cloudwatch_log_metric_filter" "language_change_events_filter" {
  name           = "${var.environment}-language-change-events"
  pattern        = "{$.req.method = \"GET\" && $.req.url = \"*lng=\" && $.req.url != \"/healthcheck/\"}"
  log_group_name = aws_cloudwatch_log_group.ecs_frontend_task_log.name

  metric_transformation {
    name      = "${var.environment}-language-change-events"
    namespace = "Authentication"
    dimensions = {
      language = "$.res.languageFromCookie",
      urlPath  = "$.req.url"
    }
    value = "1"
  }
}

resource "aws_cloudwatch_log_group" "alb_waf_log" {
  // Frustratingly, the log group name has to begin with "aws-waf-logs-" so we can't follow our normal convention here
  name              = "aws-waf-logs-frontend-alb-${var.environment}"
  kms_key_id        = aws_kms_key.cloudwatch_log_encryption.arn
  retention_in_days = var.cloudwatch_log_retention
}

resource "aws_cloudwatch_log_subscription_filter" "alb_waf_log_subscription" {
  count           = length(var.logging_endpoint_arns)
  name            = "${aws_cloudwatch_log_group.alb_waf_log.name}-splunk-subscription-${count.index}"
  log_group_name  = aws_cloudwatch_log_group.alb_waf_log.name
  filter_pattern  = ""
  destination_arn = var.logging_endpoint_arns[count.index]

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_cloudwatch_log_resource_policy" "alb_waf_log_policy" {
  policy_document = data.aws_iam_policy_document.alb_waf_log_policy_doc.json
  policy_name     = "${var.environment}-frontend-waf-log-policy"
}

data "aws_iam_policy_document" "alb_waf_log_policy_doc" {
  version = "2012-10-17"
  statement {
    effect = "Allow"
    principals {
      identifiers = ["delivery.logs.amazonaws.com"]
      type        = "Service"
    }
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.alb_waf_log.arn}:*"]
    condition {
      test     = "ArnLike"
      values   = ["arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*"]
      variable = "aws:SourceArn"
    }
    condition {
      test     = "StringEquals"
      values   = [tostring(data.aws_caller_identity.current.account_id)]
      variable = "aws:SourceAccount"
    }
  }
}
