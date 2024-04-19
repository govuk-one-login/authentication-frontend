#This is  SNS topic created in us-east-1 region for cloudwatch Alarm for Cloudfront

resource "aws_sns_topic" "slack_events" {
  provider                         = aws.cloudfront
  count                            = var.cloudfront_auth_frontend_enabled ? 1 : 0
  name                             = "${var.environment}-cloudfront-alerts"
  lambda_failure_feedback_role_arn = aws_iam_role.sns_logging_iam_role[0].arn

  tags = local.default_tags
}

data "aws_iam_policy_document" "sns_topic_policy" {
  version  = "2012-10-17"
  provider = aws.cloudfront
  count    = var.cloudfront_auth_frontend_enabled ? 1 : 0

  statement {
    actions = [
      "SNS:Subscribe",
      "SNS:SetTopicAttributes",
      "SNS:RemovePermission",
      "SNS:Receive",
      "SNS:Publish",
      "SNS:ListSubscriptionsByTopic",
      "SNS:GetTopicAttributes",
      "SNS:DeleteTopic",
      "SNS:AddPermission",
    ]

    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    resources = [
      aws_sns_topic.slack_events[0].arn,
    ]
  }
}

resource "aws_sns_topic_policy" "sns_alert_policy" {
  provider = aws.cloudfront
  count    = var.cloudfront_auth_frontend_enabled ? 1 : 0
  arn      = aws_sns_topic.slack_events[0].arn

  policy = data.aws_iam_policy_document.sns_topic_policy[0].json
}

resource "aws_iam_role" "sns_logging_iam_role" {
  provider           = aws.cloudfront
  count              = var.cloudfront_auth_frontend_enabled ? 1 : 0
  name_prefix        = "sns-failed-slack-alerts-role"
  path               = "/${var.environment}/"
  assume_role_policy = data.aws_iam_policy_document.sns_can_assume_policy[0].json

  tags = local.default_tags
}

data "aws_iam_policy_document" "sns_can_assume_policy" {
  version  = "2012-10-17"
  provider = aws.cloudfront
  count    = var.cloudfront_auth_frontend_enabled ? 1 : 0

  statement {
    effect = "Allow"
    principals {
      identifiers = [
        "sns.amazonaws.com"
      ]
      type = "Service"
    }

    actions = [
      "sts:AssumeRole"
    ]
  }
}

data "aws_iam_policy_document" "sns_logging_policy" {
  version  = "2012-10-17"
  provider = aws.cloudfront
  count    = var.cloudfront_auth_frontend_enabled ? 1 : 0

  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:PutLogEvents",
      "logs:GetLogEvents",
      "logs:FilterLogEvents",
    ]

    resources = [
      "arn:aws:logs:*:*:*",
    ]
  }
}

resource "aws_iam_policy" "api_gateway_logging_policy" {
  count       = var.cloudfront_auth_frontend_enabled ? 1 : 0
  provider    = aws.cloudfront
  name_prefix = "sns-failed-alert-logging"
  path        = "/${var.environment}/"
  description = "IAM policy for logging failed SNS alerts"

  policy = data.aws_iam_policy_document.sns_logging_policy[0].json

  lifecycle {
    create_before_destroy = true
  }

  tags = local.default_tags
}

resource "aws_iam_role_policy_attachment" "api_gateway_logging_logs" {
  provider   = aws.cloudfront
  count      = var.cloudfront_auth_frontend_enabled ? 1 : 0
  role       = aws_iam_role.sns_logging_iam_role[0].name
  policy_arn = aws_iam_policy.api_gateway_logging_policy[0].arn
}
