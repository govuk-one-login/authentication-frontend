resource "aws_lb" "frontend_alb" {
  name               = "${var.environment}-frontend"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.frontend_alb_sg.id]
  subnets            = local.public_subnet_ids

  enable_deletion_protection = false

  tags = local.default_tags
}

resource "aws_alb_target_group" "frontend_alb_target_group" {
  name        = "${var.environment}-frontend-target"
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
    path                = "/healthcheck"
    unhealthy_threshold = "2"
  }

  tags = local.default_tags
}

resource "aws_alb_listener" "frontend_alb_listener_https" {
  load_balancer_arn = aws_lb.frontend_alb.id
  port              = 443
  protocol          = "HTTPS"

  ssl_policy      = "ELBSecurityPolicy-2016-08"
  certificate_arn = aws_acm_certificate.frontend_certificate.arn

  default_action {
    target_group_arn = aws_alb_target_group.frontend_alb_target_group.id
    type             = "forward"
  }

  depends_on = [
    aws_acm_certificate_validation.frontend_acm_certificate_validation
  ]

  tags = local.default_tags
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