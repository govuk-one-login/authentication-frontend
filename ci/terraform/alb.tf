resource "aws_lb" "frontend_alb" {
  name               = "${var.environment}-frontend"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.frontend_alb_sg.id]
  subnets            = local.public_subnet_ids
  idle_timeout       = var.alb_idle_timeout

  depends_on = [
    aws_s3_bucket_policy.allow_access_alb
  ]

  enable_deletion_protection = true
  drop_invalid_header_fields = true

  dynamic "access_logs" {
    for_each = var.environment == "production" || var.environment == "staging" ? [1] : []
    content {
      bucket  = aws_s3_bucket.alb-accesslog[0].bucket
      enabled = true
      prefix  = "frontend-alb"
    }
  }
}

resource "aws_wafv2_web_acl_association" "alb_waf_association" {
  resource_arn = aws_lb.frontend_alb.arn
  web_acl_arn  = aws_cloudformation_stack.cloudfront.outputs["CloakingOriginWebACLArn"]
}

resource "aws_alb_target_group" "frontend_alb_target_group" {
  name                 = "${var.environment}-frontend-target"
  port                 = 80
  protocol             = "HTTP"
  vpc_id               = local.vpc_id
  target_type          = "ip"
  deregistration_delay = var.deregistration_delay

  health_check {
    healthy_threshold   = "2"
    interval            = "10"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = "/healthcheck/"
    unhealthy_threshold = "2"
  }
}

resource "aws_alb_listener" "frontend_alb_listener_https" {
  load_balancer_arn = aws_lb.frontend_alb.id
  port              = 443
  protocol          = "HTTPS"

  ssl_policy      = "ELBSecurityPolicy-FS-1-2-Res-2020-10"
  certificate_arn = aws_acm_certificate.frontend_alb_certificate.arn

  default_action {
    target_group_arn = aws_alb_target_group.frontend_alb_target_group.arn
    type             = "forward"
  }

  depends_on = [
    aws_acm_certificate_validation.frontend_acm_alb_certificate_validation
  ]
}

resource "aws_alb_listener_rule" "frontend_alb_listener_https_robots" {
  listener_arn = aws_alb_listener.frontend_alb_listener_https.arn
  priority     = 10

  action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = file("static/robots.txt")
      status_code  = 200
    }
  }

  condition {
    path_pattern {
      values = ["/robots.txt"]
    }
  }
}

resource "aws_alb_listener" "frontend_alb_listener_http" {
  load_balancer_arn = aws_lb.frontend_alb.id
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

#S3 Bucket for ElB access logs

data "aws_elb_service_account" "main" {}

resource "aws_s3_bucket" "alb-accesslog" {
  count         = var.environment == "production" || var.environment == "staging" ? 1 : 0
  bucket        = "${var.environment}-frontend-alb-access-logs"
  force_destroy = true
}

resource "aws_s3_bucket_policy" "allow_access_alb" {
  count  = var.environment == "production" || var.environment == "staging" ? 1 : 0
  bucket = aws_s3_bucket.alb-accesslog[0].id
  policy = data.aws_iam_policy_document.s3_bucket_lb_write[0].json
}

data "aws_iam_policy_document" "s3_bucket_lb_write" {
  count     = var.environment == "production" || var.environment == "staging" ? 1 : 0
  policy_id = "s3_bucket_lb_logs"

  statement {
    actions = [
      "s3:PutObject",
    ]
    effect = "Allow"
    resources = [
      "${aws_s3_bucket.alb-accesslog[0].arn}/*",
    ]

    principals {
      identifiers = [data.aws_elb_service_account.main.arn]
      type        = "AWS"
    }
  }
}

#### Service Down Target Group and listner ######

resource "aws_alb_target_group" "frontend_service_down_alb_target_group" {
  count       = var.service_down_page ? 1 : 0
  name        = "${var.environment}-fe-service-down"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = local.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = "3"
    interval            = "30"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = "/healthcheck/"
    unhealthy_threshold = "2"
  }
  tags = {
    Service = "service-down-page"
  }
}

resource "aws_alb_listener_rule" "service_down_rule" {
  count        = var.service_down_page ? 1 : 0
  listener_arn = aws_alb_listener.frontend_alb_listener_https.arn
  priority     = 1000

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.frontend_service_down_alb_target_group[0].arn
  }

  condition {
    path_pattern {
      values = ["/service-page-disabled/*"]
    }
  }
  tags = {
    Service = "service-down-page"
  }
}
