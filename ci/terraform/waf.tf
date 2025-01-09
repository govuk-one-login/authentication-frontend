# The IP address blocks below are referenced from here:
# https://sites.google.com/a/digital.cabinet-office.gov.uk/gds/working-at-gds/gds-internal-it/gds-internal-it-network-public-ip-addresses
resource "aws_wafv2_ip_set" "cf_gds_ip_set" {
  provider           = aws.cloudfront
  name               = "${var.environment}-gds-ip-set"
  scope              = "CLOUDFRONT"
  ip_address_version = "IPV4"

  addresses = [
    "217.196.229.77/32",
    "217.196.229.79/32",
    "217.196.229.80/32", # (BYOD VPN Only)
    "217.196.229.81/32",
    "51.149.8.0/25",   # (GDS and CO VPN)
    "51.149.8.128/29", # (BYOD VPN only)
  ]
}

resource "aws_wafv2_web_acl" "frontend_cloudfront_waf_web_acl" {
  provider = aws.cloudfront
  name     = "${var.environment}-frontend-cloudfront-waf-web-acl"
  scope    = "CLOUDFRONT"

  default_action {
    allow {}
  }

  dynamic "rule" {
    for_each = var.environment == "staging" ? [1] : []
    content {
      name     = "GDSIPs"
      priority = 10

      action {
        allow {}
      }

      statement {
        ip_set_reference_statement {
          arn = aws_wafv2_ip_set.cf_gds_ip_set.arn

          ip_set_forwarded_ip_config {
            fallback_behavior = "MATCH"
            header_name       = "X-Forwarded-For"
            position          = "FIRST"
          }
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "${replace(var.environment, "-", "")}FrontendcloudfrontWafGDSIPs"
        sampled_requests_enabled   = false
      }
    }
  }

  rule {
    action {
      block {}
    }
    priority = 11
    name     = "${var.environment}-frontend-cloudfront-waf-rate-based-rule"
    statement {
      rate_based_statement {
        limit              = var.environment == "staging" ? 20000000 : 25000
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${replace(var.environment, "-", "")}FrontendcloudfrontWafMaxRequestRate"
      sampled_requests_enabled   = true
    }
  }

  dynamic "rule" {
    for_each = var.ip_endpoint_rate_limiting_configuration
    content {
      name     = "BlockMoreThan${rule.value.limit}RequestsFromIpPer${rule.value.evaluation_window_sec}Seconds"
      priority = 20 + rule.key
      rule_label {
        name = "TooManyRequestsFromIpOnSpecificEndpoints"
      }

      action {
        block {}
      }

      statement {
        rate_based_statement {
          limit                 = rule.value.limit
          evaluation_window_sec = rule.value.evaluation_window_sec
          aggregate_key_type    = "CUSTOM_KEYS"
          custom_key {
            ip {}
          }
          custom_key {
            uri_path {
              text_transformation {
                priority = 0
                type     = "URL_DECODE"
              }
              text_transformation {
                priority = 1
                type     = "LOWERCASE"
              }
            }
          }

          scope_down_statement {
            dynamic "or_statement" {
              // If there are more than 1 provided endpoints, use an or_statement
              for_each = length(rule.value.endpoints) > 1 ? [1] : []
              content {
                dynamic "statement" {
                  for_each = rule.value.endpoints
                  content {
                    byte_match_statement {
                      positional_constraint = "STARTS_WITH"
                      search_string         = lower(statement.value)
                      field_to_match {
                        uri_path {}
                      }
                      text_transformation {
                        priority = 0
                        type     = "URL_DECODE"
                      }
                      text_transformation {
                        priority = 1
                        type     = "LOWERCASE"
                      }
                    }
                  }
                }
              }
            }
            dynamic "byte_match_statement" {
              // If there's only 1 endpoint, just create the single byte_match_statement
              for_each = length(rule.value.endpoints) == 1 ? rule.value.endpoints : []
              content {
                positional_constraint = "STARTS_WITH"
                search_string         = lower(byte_match_statement.value)
                field_to_match {
                  uri_path {}
                }
                text_transformation {
                  priority = 0
                  type     = "URL_DECODE"
                }
                text_transformation {
                  priority = 1
                  type     = "LOWERCASE"
                }
              }
            }
          }
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "${replace(var.environment, "-", "")}FrontendcloudfrontWafRatelimitByIP${rule.value.limit}Per${rule.value.evaluation_window_sec}"
        sampled_requests_enabled   = true
      }
    }
  }

  dynamic "rule" {
    for_each = var.aps_session_endpoint_rate_limiting_configuration
    content {
      name     = "BlockMoreThan${rule.value.limit}RequestsFromOneApsSessionPer${rule.value.evaluation_window_sec}Seconds"
      priority = 30 + rule.key
      rule_label {
        name = "TooManyRequestsFromOneApsSessionOnSpecificEndpoints"
      }

      action {
        block {}
      }

      statement {
        rate_based_statement {
          limit                 = rule.value.limit
          evaluation_window_sec = rule.value.evaluation_window_sec
          aggregate_key_type    = "CUSTOM_KEYS"
          custom_key {
            cookie {
              name = "aps"
              text_transformation {
                priority = 0
                type     = "URL_DECODE"
              }
              text_transformation {
                priority = 1
                type     = "LOWERCASE"
              }
            }
          }
          custom_key {
            uri_path {
              text_transformation {
                priority = 0
                type     = "URL_DECODE"
              }
              text_transformation {
                priority = 1
                type     = "LOWERCASE"
              }
            }
          }

          scope_down_statement {
            dynamic "or_statement" {
              // If there are more than 1 provided endpoints, use an or_statement
              for_each = length(rule.value.endpoints) > 1 ? [1] : []
              content {
                dynamic "statement" {
                  for_each = rule.value.endpoints
                  content {
                    byte_match_statement {
                      positional_constraint = "STARTS_WITH"
                      search_string         = lower(statement.value)
                      field_to_match {
                        uri_path {}
                      }
                      text_transformation {
                        priority = 0
                        type     = "URL_DECODE"
                      }
                      text_transformation {
                        priority = 1
                        type     = "LOWERCASE"
                      }
                    }
                  }
                }
              }
            }
            dynamic "byte_match_statement" {
              // If there's only 1 endpoint, just create the single byte_match_statement
              for_each = length(rule.value.endpoints) == 1 ? rule.value.endpoints : []
              content {
                positional_constraint = "STARTS_WITH"
                search_string         = lower(byte_match_statement.value)
                field_to_match {
                  uri_path {}
                }
                text_transformation {
                  priority = 0
                  type     = "URL_DECODE"
                }
                text_transformation {
                  priority = 1
                  type     = "LOWERCASE"
                }
              }
            }
          }
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "${replace(var.environment, "-", "")}FrontendcloudfrontWafRatelimitByApsSession${rule.value.limit}Per${rule.value.evaluation_window_sec}"
        sampled_requests_enabled   = true
      }
    }
  }

  rule {
    override_action {
      none {}
    }
    priority = 40
    name     = "${var.environment}-frontend-cloudfront-common-rule-set"

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"

        rule_action_override {
          name = "GenericRFI_QUERYARGUMENTS"
          action_to_use {
            count {}
          }
        }
        rule_action_override {
          name = "GenericRFI_BODY"
          action_to_use {
            count {}
          }
        }
        rule_action_override {
          name = "SizeRestrictions_QUERYSTRING"
          action_to_use {
            count {}
          }
        }
        dynamic "rule_action_override" {
          for_each = var.environment != "production" ? ["1"] : []
          content {
            name = "EC2MetaDataSSRF_BODY"
            action_to_use {
              count {}
            }
          }
        }
        dynamic "rule_action_override" {
          for_each = var.environment != "production" ? ["1"] : []
          content {
            name = "EC2MetaDataSSRF_QUERYARGUMENTS"
            action_to_use {
              count {}
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${replace(var.environment, "-", "")}FrontendcloudfrontWafCommonRuleSet"
      sampled_requests_enabled   = true
    }
  }

  rule {
    override_action {
      none {}
    }
    priority = 50
    name     = "${var.environment}-frontend-cloudfront-bad-rule-set"

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${replace(var.environment, "-", "")}FrontendcloudfrontWafBaduleSet"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "default_query_param_limit"
    priority = 60

    action {
      block {}
    }

    statement {
      and_statement {
        statement {
          size_constraint_statement {
            comparison_operator = "GT"
            size                = 2048
            field_to_match {
              query_string {}
            }
            text_transformation {
              priority = 0
              type     = "NONE"
            }
          }
        }

        statement {
          not_statement {
            statement {
              byte_match_statement {
                positional_constraint = "EXACTLY"
                search_string         = "/authorize"
                field_to_match {
                  uri_path {}
                }
                text_transformation {
                  priority = 0
                  type     = "LOWERCASE"
                }
              }
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${replace(var.environment, "-", "")}FrontendcloudfrontWafQueryParamSet"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "extended_query_param_limit"
    priority = 70

    action {
      block {}
    }

    statement {
      size_constraint_statement {
        comparison_operator = "GT"
        size                = 8192
        field_to_match {
          query_string {}
        }
        text_transformation {
          priority = 0
          type     = "NONE"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${replace(var.environment, "-", "")}FrontendcloudfrontWafAuthorizeQueryParamSet"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "contact_us_logging_count"
    priority = 90

    action {
      count {}
    }

    rule_label {
      name = "contact-us"
    }

    statement {
      byte_match_statement {
        positional_constraint = "STARTS_WITH"
        search_string         = "/contact-us"
        field_to_match {
          uri_path {}
        }
        text_transformation {
          priority = 0
          type     = "LOWERCASE"
        }
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${replace(var.environment, "-", "")}FrontendcloudfrontWafContactUsCount"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${replace(var.environment, "-", "")}FrontendcloudfrontWafRules"
    sampled_requests_enabled   = true
  }

  lifecycle {
    precondition {
      condition     = length(var.ip_endpoint_rate_limiting_configuration) + length(var.aps_session_endpoint_rate_limiting_configuration) < 9
      error_message = "There can't be more than 9 endpoint_rate_limiting_configuration (quota is shared between IP and APS session)"
    }
  }
}

# Cloudwatch Logging for frontend Cloudfront WAF
# Adding Local variable for splunk Logging for US east region as

locals {
  logging_endpoint_arns_us_east = "arn:aws:logs:us-east-1:885513274347:destination:csls_cw_logs_destination_prodpython"
}

data "aws_iam_policy_document" "frontend_cloudfront_cloudwatch" {
  provider = aws.cloudfront

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
        "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:root",
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
        "logs.us-east-1.amazonaws.com",
      ]
    }
    resources = ["*"]
  }
}

resource "aws_kms_key" "frontent_cloudfront_cw_log_encryption" {
  provider = aws.cloudfront

  description             = "KMS key for Core Cloudwatch logs"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  policy                  = data.aws_iam_policy_document.frontend_cloudfront_cloudwatch.json
}

resource "aws_cloudwatch_log_group" "frontend_cloudfront_waf_log_group" {
  provider = aws.cloudfront

  name              = "aws-waf-logs-frontend-cloudfront-${var.environment}"
  kms_key_id        = aws_kms_key.frontent_cloudfront_cw_log_encryption.arn
  retention_in_days = var.cloudwatch_log_retention
}

resource "aws_wafv2_web_acl_logging_configuration" "frontend_cloudfront_waf_logging_config" {
  provider = aws.cloudfront

  log_destination_configs = [aws_cloudwatch_log_group.frontend_cloudfront_waf_log_group.arn]
  resource_arn            = aws_wafv2_web_acl.frontend_cloudfront_waf_web_acl.arn

  logging_filter {
    default_behavior = "KEEP"

    filter {
      behavior = "KEEP"

      condition {
        action_condition {
          action = "BLOCK"
        }
      }

      requirement = "MEETS_ANY"
    }
  }
}


resource "aws_cloudwatch_log_subscription_filter" "frontend_cloudfront_waf_subscription" {
  provider = aws.cloudfront

  count           = var.environment == "production" || var.environment == "staging" ? 1 : 0
  name            = "${aws_cloudwatch_log_group.frontend_cloudfront_waf_log_group.name}-splunk-subscription-${count.index}"
  log_group_name  = aws_cloudwatch_log_group.frontend_cloudfront_waf_log_group.name
  filter_pattern  = ""
  destination_arn = local.logging_endpoint_arns_us_east
  depends_on      = [aws_cloudwatch_log_group.frontend_cloudfront_waf_log_group]

  lifecycle {
    create_before_destroy = false
  }
}
