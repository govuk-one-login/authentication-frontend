resource "aws_security_group" "frontend_redis_security_group" {
  name_prefix = "${var.environment}-frontend-redis-security-group-"
  description = "Allow ingress to frontend Redis. Use on Elasticache cluster only"
  vpc_id      = local.vpc_id

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group_rule" "allow_incoming_frontend_redis_from_private_subnet" {
  security_group_id = aws_security_group.frontend_redis_security_group.id

  from_port   = local.redis_port_number
  protocol    = "tcp"
  cidr_blocks = local.private_subnet_cidr_blocks
  to_port     = local.redis_port_number
  type        = "ingress"
}

resource "aws_security_group_rule" "allow_incoming_frontend_redis_from_new_auth" {
  count = length(var.new_auth_protectedsub_cidr_blocks) == 0 ? 0 : 1

  description       = "Allow ingress to Redis from new Auth equivalent environment protected subnets"
  security_group_id = aws_security_group.frontend_redis_security_group.id

  from_port   = local.redis_port_number
  protocol    = "tcp"
  cidr_blocks = var.new_auth_protectedsub_cidr_blocks
  to_port     = local.redis_port_number
  type        = "ingress"
}

resource "aws_security_group" "allow_access_to_frontend_redis" {
  name_prefix = "${var.environment}-allow-access-to-frontend-redis-"
  description = "Allow outgoing access to the frontend Redis session store"
  vpc_id      = local.vpc_id

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group_rule" "allow_connection_to_frontend_redis" {
  security_group_id = aws_security_group.allow_access_to_frontend_redis.id

  from_port                = local.redis_port_number
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.frontend_redis_security_group.id
  to_port                  = local.redis_port_number
  type                     = "egress"
}

resource "aws_security_group" "frontend_alb_sg" {
  name_prefix = "${var.environment}-frontend-alb-"
  vpc_id      = local.vpc_id

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group_rule" "allow_alb_http_ingress_from_anywhere" {
  security_group_id = aws_security_group.frontend_alb_sg.id
  type              = "ingress"

  description = "http"
  protocol    = "tcp"
  from_port   = 80
  to_port     = 80
  cidr_blocks = var.incoming_traffic_cidr_blocks
}

resource "aws_security_group_rule" "allow_alb_https_ingress_from_anywhere" {
  security_group_id = aws_security_group.frontend_alb_sg.id
  type              = "ingress"

  description = "https"
  protocol    = "tcp"
  from_port   = 443
  to_port     = 443
  cidr_blocks = var.incoming_traffic_cidr_blocks
}

resource "aws_security_group_rule" "allow_alb_application_egress_to_task_group" {
  security_group_id = aws_security_group.frontend_alb_sg.id
  type              = "egress"

  description              = "http"
  protocol                 = "tcp"
  from_port                = local.application_port
  to_port                  = local.application_port
  source_security_group_id = aws_security_group.frontend_ecs_tasks_sg.id
}

resource "aws_security_group" "frontend_ecs_tasks_sg" {
  name_prefix = "${var.environment}-frontend-ecs-task-"
  vpc_id      = local.vpc_id

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group_rule" "allow_ecs_task_ingress_from_alb" {
  security_group_id = aws_security_group.frontend_ecs_tasks_sg.id
  type              = "ingress"

  description              = "http"
  protocol                 = "tcp"
  from_port                = local.application_port
  to_port                  = local.application_port
  source_security_group_id = aws_security_group.frontend_alb_sg.id
}

### Service Down ECS security group ###

resource "aws_security_group" "service_down_page" {
  count       = var.service_down_page ? 1 : 0
  name_prefix = "${var.environment}-service-down-page-"
  description = "Allow access from public subnet to service down page port"
  vpc_id      = local.vpc_id

  lifecycle {
    create_before_destroy = true
  }
  tags = {
    Service = "service-down-page"
  }
}

resource "aws_security_group_rule" "allow_incoming_http_from_frontend_alb" {
  count             = var.service_down_page ? 1 : 0
  security_group_id = aws_security_group.service_down_page[0].id
  protocol          = "tcp"
  from_port         = local.service_down_page_app_port
  to_port           = local.service_down_page_app_port
  type              = "ingress"

  source_security_group_id = aws_security_group.frontend_alb_sg.id
}

resource "aws_security_group_rule" "allow_frontend_alb_to_service_down" {
  count             = var.service_down_page ? 1 : 0
  security_group_id = aws_security_group.frontend_alb_sg.id
  protocol          = "tcp"
  from_port         = local.service_down_page_app_port
  to_port           = local.service_down_page_app_port
  type              = "egress"

  source_security_group_id = aws_security_group.service_down_page[0].id
}
