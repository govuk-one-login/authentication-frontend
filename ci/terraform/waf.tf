resource "aws_wafv2_web_acl" "frontend_alb_waf_regional_web_acl" {
  name  = "${var.environment}-frontend-alb-waf-web-acl"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    action {
      block {}
    }
    priority = 1
    name     = "${var.environment}-frontend-alb-waf-rate-based-rule"
    statement {
      rate_based_statement {
        limit              = 5000
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${replace(var.environment, "-", "")}FrontendAlbWafMaxRequestRate"
      sampled_requests_enabled   = true
    }
  }

  rule {
    override_action {
      none {}
    }
    priority = 2
    name     = "${var.environment}-frontend-alb-common-rule-set"

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"

        excluded_rule {
          name = "GenericRFI_QUERYARGUMENTS"
        }
        excluded_rule {
          name = "GenericRFI_BODY"
        }
        dynamic "excluded_rule" {
          for_each = var.environment != "production" ? ["1"] : []
          content {
            name = "EC2MetaDataSSRF_BODY"
          }
        }
        dynamic "excluded_rule" {
          for_each = var.environment != "production" ? ["1"] : []
          content {
            name = "EC2MetaDataSSRF_QUERYARGUMENTS"
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${replace(var.environment, "-", "")}FrontendAlbWafCommonRuleSet"
      sampled_requests_enabled   = true
    }
  }

  rule {
    override_action {
      none {}
    }
    priority = 3
    name     = "${var.environment}-frontend-alb-bad-rule-set"

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${replace(var.environment, "-", "")}FrontendAlbWafBaduleSet"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${replace(var.environment, "-", "")}FrontendAlbWafRules"
    sampled_requests_enabled   = true
  }

  tags = local.default_tags
}

resource "aws_wafv2_web_acl_association" "alb_waf_association" {
  resource_arn = aws_lb.frontend_alb.arn
  web_acl_arn  = aws_wafv2_web_acl.frontend_alb_waf_regional_web_acl.arn
}

resource "aws_wafv2_web_acl_logging_configuration" "frontend_alb_waf_logging_config" {
  log_destination_configs = [aws_cloudwatch_log_group.alb_waf_log.arn]
  resource_arn            = aws_wafv2_web_acl.frontend_alb_waf_regional_web_acl.arn

  logging_filter {
    default_behavior = "DROP"

    filter {
      behavior = "DROP"

      condition {
        action_condition {
          action = "BLOCK"
        }
      }

      requirement = "MEETS_ANY"
    }
  }
}
