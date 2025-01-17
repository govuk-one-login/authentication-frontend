resource "aws_cloudformation_stack" "cloudfront" {
  name = "${var.environment}-auth-fe-cloudfront"
  #using fixed version of cloudfron disturbution template for now
  template_url = "https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/cloudfront-distribution/template.yaml?versionId=._qPLI5sbnZN3T3jHF7fezX8BT6fK3j3"

  capabilities = ["CAPABILITY_NAMED_IAM"]

  parameters = {
    AddWWWPrefix                 = var.Add_WWWPrefix
    CloudFrontCertArn            = aws_acm_certificate.cloudfront_frontend_certificate.arn
    CloudFrontWafACL             = aws_wafv2_web_acl.frontend_cloudfront_waf_web_acl.arn
    DistributionAlias            = local.frontend_fqdn
    FraudHeaderEnabled           = var.Fraud_Header_Enabled
    OriginCloakingHeader         = var.auth_origin_cloakingheader
    PreviousOriginCloakingHeader = var.previous_auth_origin_cloakingheader
    StandardLoggingEnabled       = true
    LogDestination               = var.cloudfront_WafAcl_Logdestination
  }
}

resource "aws_cloudformation_stack" "cloudfront-monitoring" {
  provider = aws.cloudfront
  name     = "${var.environment}-auth-fe-cloudfront-monitoring"
  #using fixed version of cloudfront monitoring  disturbution template for now
  template_url = "https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/cloudfront-monitoring-alarm/template.yaml?versionId=td2KHIlG7KGXl0mkMrRDkgBWxdXPEMZ."

  capabilities = ["CAPABILITY_NAMED_IAM"]

  parameters = {
    CacheHitAlarmSNSTopicARN            = aws_sns_topic.slack_events.arn
    CloudFrontAdditionaldMetricsEnabled = true
    CloudfrontDistribution              = aws_cloudformation_stack.cloudfront.outputs["DistributionId"]
  }
  depends_on = [aws_cloudformation_stack.cloudfront]
}
