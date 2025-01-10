resource "aws_cloudformation_stack" "cloudfront" {
  name = "${var.environment}-auth-fe-cloudfront"
  #using fixed version of cloudfron disturbution template for now
  template_url = "https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/cloudfront-distribution/template.yaml?versionId=jZcckkadQOPteu3t24UktqjOehImqD1K"

  capabilities = ["CAPABILITY_NAMED_IAM"]

  parameters = {
    DistributionAlias            = local.frontend_fqdn
    CloudFrontCertArn            = aws_acm_certificate.cloudfront_frontend_certificate.arn
    AddWWWPrefix                 = var.Add_WWWPrefix
    FraudHeaderEnabled           = var.Fraud_Header_Enabled
    OriginCloakingHeader         = var.auth_origin_cloakingheader
    PreviousOriginCloakingHeader = var.previous_auth_origin_cloakingheader
    CloudFrontWafACL             = aws_wafv2_web_acl.frontend_cloudfront_waf_web_acl.arn
    StandardLoggingEnabled       = true
    ForwardAccessLogsToSplunk    = var.cloudfront_ForwardAccessLogsToSplunk
    LogDestination               = var.cloudfront_WafAcl_Logdestination
  }

  #ignoring below parameter as these parameter are been read via secret manager and terraform continually detects changes
  # Note : we need to remove the below lifecycle if the Header are changed in Secret manager to appy new cloainking header value
  lifecycle {
    ignore_changes = [parameters["OriginCloakingHeader"], parameters["PreviousOriginCloakingHeader"]]
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
