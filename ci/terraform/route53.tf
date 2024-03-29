resource "aws_route53_zone" "zone" {
  name = local.frontend_fqdn

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_route53_record" "frontend" {
  name    = local.frontend_fqdn
  type    = "A"
  zone_id = data.aws_route53_zone.service_domain.zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_lb.frontend_alb.dns_name
    zone_id                = aws_lb.frontend_alb.zone_id
  }
}

resource "aws_route53_record" "frontend_record" {
  name    = local.frontend_fqdn
  type    = "A"
  zone_id = aws_route53_zone.zone.zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_lb.frontend_alb.dns_name
    zone_id                = aws_lb.frontend_alb.zone_id
  }
}

resource "aws_acm_certificate" "frontend_alb_certificate" {
  domain_name       = aws_route53_record.frontend.name
  validation_method = "DNS"

  tags = local.default_tags

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
