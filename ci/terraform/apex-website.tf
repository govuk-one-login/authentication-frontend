locals {
  apex_website_tags = {
    Service = "apex-website"
  }
}
data "aws_iam_policy_document" "s3_kms" {
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
    sid = "AllowS3AnonymousAccess"
    actions = [
      "kms:Decrypt",
    ]
    effect = "Allow"
    principals {
      type = "Service"
      identifiers = [
        "cloudfront.amazonaws.com"
      ]
    }
    condition {
      test     = "StringEquals"
      values   = [aws_cloudfront_distribution.www_s3_distribution.arn]
      variable = "AWS:SourceArn"
    }
    resources = ["*"]
  }
}

resource "aws_kms_key" "apex_static_web_site_key" {
  description             = "This key is used to encrypt bucket objects"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  policy = data.aws_iam_policy_document.s3_kms.json

  tags = local.apex_website_tags
}

resource "aws_s3_bucket" "apex_static_website" {
  bucket_prefix = "${var.environment}-di-root-website"

  tags = local.apex_website_tags
}

resource "aws_s3_bucket_public_access_block" "apex_static_website" {
  bucket = aws_s3_bucket.apex_static_website.bucket

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_iam_policy_document" "apex_static_website" {
  version = "2012-10-17"
  statement {
    sid    = "PublicReadGetObject"
    effect = "Allow"
    principals {
      identifiers = ["cloudfront.amazonaws.com"]
      type        = "Service"
    }
    actions = ["s3:GetObject"]
    condition {
      test     = "StringEquals"
      values   = [aws_cloudfront_distribution.www_s3_distribution.arn]
      variable = "AWS:SourceArn"
    }
    resources = ["${aws_s3_bucket.apex_static_website.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "apex_static_website" {
  bucket = aws_s3_bucket.apex_static_website.bucket
  policy = data.aws_iam_policy_document.apex_static_website.json
}

resource "aws_s3_bucket_acl" "apex_static_website" {
  bucket = aws_s3_bucket.apex_static_website.bucket
  acl    = "private"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "apex_static_website" {
  bucket = aws_s3_bucket.apex_static_website.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.apex_static_web_site_key.id
    }
  }
}

resource "aws_s3_bucket_versioning" "apex_static_website" {
  bucket = aws_s3_bucket.apex_static_website.bucket

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_object" "robots" {
  key    = "robots.txt"
  bucket = aws_s3_bucket.apex_static_website.bucket

  content_type  = "text/plain"
  cache_control = "no-cache"

  source = "static/robots.txt"

  tags = local.apex_website_tags
}

locals {
  gov_uk_frontend_version = var.gov_uk_frontend_version
  unzip_src_dir           = "static/govuk-frontend"
  unzip_out_dir           = "static/govuk-frontend/release-v${local.gov_uk_frontend_version}"
  mime_types = jsondecode(jsonencode(
    {
      css   = "text/css"
      js    = "text/javascript"
      svg   = "image/svg+xml"
      png   = "image/png"
      ico   = "image/x-icon"
      map   = "text/javascript"
      txt   = "text/plain"
      woff  = "font/woff"
      woff2 = "font/woff2"
    }
  ))
  deploy_apex_static_page = true
}

resource "aws_s3_object" "govuk_frontend_unzipped" {

  for_each = fileset(local.unzip_out_dir, "**/*")

  bucket        = aws_s3_bucket.apex_static_website.bucket
  key           = each.value
  source        = "${local.unzip_out_dir}/${each.value}"
  acl           = "private"
  content_type  = lookup(local.mime_types, substr(regex("\\.[^.]+$", each.value), 1, -1), null)
  cache_control = "no-cache"

  tags = local.apex_website_tags
}

resource "aws_acm_certificate" "apex_certificate" {
  provider = aws.cloudfront

  domain_name       = local.service_domain
  validation_method = "DNS"

  tags = local.apex_website_tags
}

resource "aws_route53_record" "apex_certificate_certificate_validation" {
  for_each = {
    for dvo in aws_acm_certificate.apex_certificate.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.service_domain.id
}

resource "aws_acm_certificate_validation" "apex_certificate_certificate_validation" {
  provider = aws.cloudfront

  certificate_arn         = aws_acm_certificate.apex_certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.apex_certificate_certificate_validation : record.fqdn]
}

resource "aws_cloudfront_response_headers_policy" "hsts_header_policy" {
  name = "${var.environment}-hsts-headers-policy"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      preload                    = true
      include_subdomains         = true
      override                   = true
    }
  }
}

resource "aws_cloudfront_function" "redirect_function" {
  name = "${var.environment}-cloudfront-am-redirect"
  code = templatefile("static/redirect.js", {
    REDIRECT_BASE_URL = var.apex_redirect_url
  })
  runtime = "cloudfront-js-1.0"
  publish = true
}

resource "aws_cloudfront_function" "apex_redirect_page_function" {

  name = "${var.environment}-cloudfront-apex-static-redirect-page"
  code = templatefile("static/apex-static-redirect-page.js", {
    REDIRECT_BASE_URL = var.apex_redirect_url
    SUPPORT_URL       = var.apex_support_url
  })
  runtime = "cloudfront-js-1.0"
  publish = true
}

resource "aws_cloudfront_distribution" "www_s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.apex_static_website.bucket_regional_domain_name
    origin_id   = local.service_domain

    origin_access_control_id = aws_cloudfront_origin_access_control.www_s3_distribution.id
  }

  aliases    = [local.service_domain]
  web_acl_id = aws_wafv2_web_acl.apex_cloudfront_waf_regional_web_acl.arn

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.service_domain

    response_headers_policy_id = aws_cloudfront_response_headers_policy.hsts_header_policy.id
    // This is the ID of the AWS managed "CachingDisabled" policy, see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-caching-disabled
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    function_association {
      event_type   = "viewer-request"
      function_arn = local.deploy_apex_static_page ? aws_cloudfront_function.apex_redirect_page_function.arn : aws_cloudfront_function.redirect_function.arn
    }

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern = "robots.txt"

    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.service_domain

    // This is the ID of the AWS managed "CachingDisabled" policy, see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-caching-disabled
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    viewer_protocol_policy = "allow-all"
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern = "/*.css"

    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.service_domain

    // This is the ID of the AWS managed "CachingDisabled" policy, see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-caching-disabled
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern = "/*.js"

    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.service_domain

    // This is the ID of the AWS managed "CachingDisabled" policy, see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-caching-disabled
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern = "/*.map"

    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.service_domain

    // This is the ID of the AWS managed "CachingDisabled" policy, see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-caching-disabled
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern = "/assets/*"

    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.service_domain

    // This is the ID of the AWS managed "CachingDisabled" policy, see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-caching-disabled
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }


  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.apex_certificate_certificate_validation.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2019"
  }

  tags = local.apex_website_tags
}

resource "aws_cloudfront_origin_access_control" "www_s3_distribution" {
  name                              = "${var.environment}-apex-s3-bucket-access"
  description                       = "Access to S3 buckets"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_route53_record" "apex_a_record" {
  name    = local.service_domain
  type    = "A"
  zone_id = data.aws_route53_zone.service_domain.id

  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.www_s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.www_s3_distribution.hosted_zone_id
  }
}
