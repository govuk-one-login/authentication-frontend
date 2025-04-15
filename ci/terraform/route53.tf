resource "aws_route53_zone" "zone" {
  name = local.frontend_fqdn

}

resource "aws_route53_record" "frontend" {
  name    = local.frontend_fqdn
  type    = "A"
  zone_id = data.aws_route53_zone.service_domain.zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_cloudformation_stack.cloudfront.outputs["DistributionDomain"]
    zone_id                = var.cloudfront_zoneid
  }
}

resource "aws_route53_record" "frontend_record" {
  name    = local.frontend_fqdn
  type    = "A"
  zone_id = aws_route53_zone.zone.zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_cloudformation_stack.cloudfront.outputs["DistributionDomain"]
    zone_id                = var.cloudfront_zoneid
  }
}

resource "aws_acm_certificate" "frontend_alb_certificate" {
  domain_name       = aws_route53_record.frontend.name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "frontend_alb_certificate_validation" {
  for_each = {
    for dvo in aws_acm_certificate.frontend_alb_certificate.domain_validation_options : dvo.domain_name => {
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
  zone_id         = data.aws_route53_zone.service_domain.zone_id
}

resource "aws_route53_record" "frontend_validation_record" {
  for_each = {
    for dvo in aws_acm_certificate.frontend_alb_certificate.domain_validation_options : dvo.domain_name => {
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
  zone_id         = aws_route53_zone.zone.zone_id
}

resource "aws_acm_certificate_validation" "frontend_acm_alb_certificate_validation" {
  certificate_arn         = aws_acm_certificate.frontend_alb_certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.frontend_validation_record : record.fqdn]
}

output "signin_nameservers" {
  value = aws_route53_zone.zone.name_servers
}

#DNS Record for cloufront origin Domain & TLS certificate

resource "aws_route53_record" "Cloudfront_frontend_record" {
  name    = local.frontend_fqdn_origin
  type    = "A"
  zone_id = aws_route53_zone.zone.zone_id

  alias {
    evaluate_target_health = false
    name                   = "dualstack.${aws_lb.frontend_alb.dns_name}"
    zone_id                = aws_lb.frontend_alb.zone_id
  }
}

resource "aws_acm_certificate" "cloudfront_frontend_certificate" {
  provider          = aws.cloudfront
  domain_name       = local.frontend_fqdn
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cloudfront_frontend_certificate_validation" {
  provider = aws.cloudfront
  for_each = {
    for dvo in aws_acm_certificate.cloudfront_frontend_certificate.domain_validation_options : dvo.domain_name => {
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
  zone_id         = aws_route53_zone.zone.zone_id
  depends_on      = [aws_acm_certificate.cloudfront_frontend_certificate]
}

resource "aws_acm_certificate_validation" "frontend_acm_cloudfront_certificate_validation" {
  provider                = aws.cloudfront
  certificate_arn         = aws_acm_certificate.cloudfront_frontend_certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.cloudfront_frontend_certificate_validation : record.fqdn]
  depends_on              = [aws_route53_record.cloudfront_frontend_certificate_validation]
}
