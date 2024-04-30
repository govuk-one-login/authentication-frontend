
locals {
  Apply_CloakingHeader_waf = (var.cloudfront_auth_dns_enabled ? true : false)  # When DNS flag is enabled this CloakingHeader_waf gets  attached to ALB 
}


resource "aws_cloudformation_stack" "cloudfront" {
  count = var.cloudfront_auth_frontend_enabled ? 1 : 0
  name  = "${var.environment}-auth-fe-cloudfront"
  #using fixed version of template for now 
  template_url = "https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/cloudfront-distribution/template.yaml?versionId=EKk9m9vMv10qF5vHzWZogFLnQQw6_Yjc"

  capabilities = ["CAPABILITY_NAMED_IAM"]

  parameters = {
    AddWWWPrefix                   = var.Add_WWWPrefix
    ApplyCloakingHeaderWAFToOrigin = local.Apply_CloakingHeader_waf
    CloudFrontCertArn              = aws_acm_certificate.cloudfront_frontend_certificate[0].arn
    CloudfrontWafAcl               = aws_wafv2_web_acl.frontend_cloudfront_waf_web_acl[0].arn
    DistributionAlias              = local.frontend_fqdn
    FraudHeaderEnabled             = var.Fraud_Header_Enabled
    OriginCloakingHeader           = var.auth_origin_cloakingheader
    OriginResourceArn              = aws_lb.frontend_alb.id
    OriginWafAcl                   = "none"
    PreviousOriginCloakingHeader   = var.previous_auth_origin_cloakingheader
    StandardLoggingEnabled         = true
  }
  tags = local.default_tags
}

resource "aws_cloudformation_stack" "cloudfront-monitoring" {
  count        = var.cloudfront_auth_frontend_enabled ? 1 : 0
  provider     = aws.cloudfront
  name         = "${var.environment}-auth-fe-cloudfront-monitoring"
  template_url = "https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/cloudfront-monitoring-alarm/template.yaml?z=${timestamp()}"

  capabilities = ["CAPABILITY_NAMED_IAM"]

  parameters = {
    CacheHitAlarmSNSTopicARN            = aws_sns_topic.slack_events[0].arn
    CloudFrontAdditionaldMetricsEnabled = true
    CloudfrontDistribution              = aws_cloudformation_stack.cloudfront[0].outputs["DistributionId"]
  }
  depends_on = [aws_cloudformation_stack.cloudfront]
  tags       = local.default_tags
}
