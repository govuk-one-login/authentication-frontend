# The IP address blocks below are referenced from here:
# https://sites.google.com/a/digital.cabinet-office.gov.uk/gds/working-at-gds/gds-internal-it/gds-internal-it-network-public-ip-addresses
resource "aws_wafv2_ip_set" "gds_ip_set" {
  name               = "${var.environment}-gds-ip-set"
  scope              = "REGIONAL"
  ip_address_version = "IPV4"

  addresses = [
    "217.196.229.77/32",
    "217.196.229.79/32",
    "217.196.229.80/32", # (BYOD VPN Only)
    "217.196.229.81/32",
    "51.149.8.0/25",   # (GDS and CO VPN)
    "51.149.8.128/29", # (BYOD VPN only)
    # The following are Pentesters, requested on AUT-2360
    "51.142.180.30/32",
    "185.120.72.241/32",
    "185.120.72.242/32",
    "185.120.72.243/32",
    # The following are Pentesters, requested on AUT-2596
    "3.9.227.33/32",
    "18.132.149.145/32"

  ]

  tags = local.default_tags
}

locals {
  cloudfront_origin_cloaking_header_name = "origin-cloaking-secret"
}

resource "aws_wafv2_web_acl" "frontend_alb_waf_regional_web_acl" {
  name  = "${var.environment}-frontend-alb-waf-web-acl"
  scope = "REGIONAL"

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
          arn = aws_wafv2_ip_set.gds_ip_set.arn

          ip_set_forwarded_ip_config {
            fallback_behavior = "MATCH"
            header_name       = "X-Forwarded-For"
            position          = "FIRST"
          }
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "${replace(var.environment, "-", "")}FrontendAlbWafGDSIPs"
        sampled_requests_enabled   = false
      }
    }
  }

  rule {
    action {
      block {}
    }
    priority = 20
    name     = "${var.environment}-frontend-alb-waf-rate-based-rule"
    statement {
      rate_based_statement {
        limit              = var.environment == "staging" ? 20000000 : 25000
        aggregate_key_type = "IP"
        scope_down_statement {
          and_statement {
            statement {
              not_statement {
                statement {
                  byte_match_statement {
                    field_to_match {
                      single_header {
                        name = local.cloudfront_origin_cloaking_header_name
                      }
                    }
                    positional_constraint = "EXACTLY"
                    search_string         = var.auth_origin_cloakingheader
                    text_transformation {
                      priority = 0
                      type     = "NONE"
                    }
                  }
                }
              }
            }

            statement {
              not_statement {
                statement {
                  byte_match_statement {
                    field_to_match {
                      single_header {
                        name = local.cloudfront_origin_cloaking_header_name
                      }
                    }
                    positional_constraint = "EXACTLY"
                    search_string         = var.previous_auth_origin_cloakingheader
                    text_transformation {
                      priority = 0
                      type     = "NONE"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${replace(var.environment, "-", "")}FrontendAlbWafMaxRequestRate"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "BlockMoreThan100CheckYourEmailRequestsFromIPPer5Minutes"
    priority = 21
    rule_label {
      name = "MoreThan100CheckYourEmailRequestsFromIPPer5Minutes"
    }

    action {
      count {}
    }

    statement {
      rate_based_statement {
        limit                 = var.environment == "staging" ? 20000000 : var.rate_limited_endpoints_requests_per_period
        evaluation_window_sec = var.rate_limited_endpoints_rate_limit_period
        aggregate_key_type    = "IP"


        scope_down_statement {
          or_statement {
            dynamic "statement" {
              for_each = var.rate_limited_endpoints
              content {
                byte_match_statement {
                  positional_constraint = "STARTS_WITH"
                  search_string         = statement.value
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
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${replace(var.environment, "-", "")}FrontendAlbWafMoreThan100CheckYourEmailRequestsFromIPPer5Minutes"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "BlockMoreThan100CheckYourEmailRequestsFromApsSessionPer5Minutes"
    priority = 22

    rule_label {
      name = "MoreThan100CheckYourEmailRequestsFromApsSessionPer5Minutes"
    }

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit                 = var.environment == "staging" ? 20000000 : var.rate_limited_endpoints_requests_per_period
        evaluation_window_sec = var.rate_limited_endpoints_rate_limit_period
        aggregate_key_type    = "CUSTOM_KEYS"
        custom_key {
          cookie {
            name = "aps"
            text_transformation {
              priority = 0
              type     = "URL_DECODE"
            }
          }
        }
        scope_down_statement {
          or_statement {
            dynamic "statement" {
              for_each = var.rate_limited_endpoints
              content {
                byte_match_statement {
                  positional_constraint = "STARTS_WITH"
                  search_string         = statement.value
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
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${replace(var.environment, "-", "")}FrontendAlbWafMoreThan100CheckYourEmailRequestsFromApsSessionPer5Minutes"
      sampled_requests_enabled   = true
    }
  }

  rule {
    override_action {
      none {}
    }
    priority = 30
    name     = "${var.environment}-frontend-alb-common-rule-set"

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
      metric_name                = "${replace(var.environment, "-", "")}FrontendAlbWafCommonRuleSet"
      sampled_requests_enabled   = true
    }
  }

  rule {
    override_action {
      none {}
    }
    priority = 40
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

  rule {
    name     = "default_query_param_limit"
    priority = 50

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
      metric_name                = "${replace(var.environment, "-", "")}FrontendAlbWafQueryParamSet"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "extended_query_param_limit"
    priority = 60

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
      metric_name                = "${replace(var.environment, "-", "")}FrontendAlbWafAuthorizeQueryParamSet"
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
      metric_name                = "${replace(var.environment, "-", "")}FrontendAlbWafContactUsCount"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "count_not_cloudfront"
    priority = 99

    action {
      count {}
    }

    statement {
      not_statement {
        statement {
          or_statement {
            statement {
              byte_match_statement {
                field_to_match {
                  single_header {
                    name = local.cloudfront_origin_cloaking_header_name
                  }
                }
                positional_constraint = "EXACTLY"
                search_string         = var.auth_origin_cloakingheader
                text_transformation {
                  priority = 0
                  type     = "NONE"
                }
              }
            }

            statement {
              byte_match_statement {
                field_to_match {
                  single_header {
                    name = local.cloudfront_origin_cloaking_header_name
                  }
                }
                positional_constraint = "EXACTLY"
                search_string         = var.previous_auth_origin_cloakingheader
                text_transformation {
                  priority = 0
                  type     = "NONE"
                }
              }
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${replace(var.environment, "-", "")}AuthWafNotCloudFrontCount"
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
  web_acl_arn  = var.cloudfront_auth_dns_enabled ? aws_cloudformation_stack.cloudfront[0].outputs["CloakingOriginWebACLArn"] : aws_wafv2_web_acl.frontend_alb_waf_regional_web_acl.arn
}

resource "aws_wafv2_web_acl_logging_configuration" "frontend_alb_waf_logging_config" {
  log_destination_configs = [aws_cloudwatch_log_group.alb_waf_log.arn]
  resource_arn            = aws_wafv2_web_acl.frontend_alb_waf_regional_web_acl.arn

  logging_filter {
    default_behavior = "KEEP"

    filter {
      behavior    = "KEEP"
      requirement = "MEETS_ALL"

      condition {
        label_name_condition {
          label_name = "awswaf:${data.aws_caller_identity.current.account_id}:webacl:${aws_wafv2_web_acl.frontend_alb_waf_regional_web_acl.name}:contact-us"
        }
      }
    }
  }
}
