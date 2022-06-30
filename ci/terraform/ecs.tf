locals {
  service_name   = "${var.environment}-frontend-ecs-service"
  container_name = "frontend-application"

  nginx_port       = 8080
  application_port = var.basic_auth_password == "" ? var.app_port : local.nginx_port

  frontend_container_definition = {
    name      = local.container_name
    image     = "${var.image_uri}:${var.image_tag}@${var.image_digest}"
    essential = true
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.ecs_frontend_task_log.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = local.service_name
      }
    }
    portMappings = [
      {
        protocol      = "tcp"
        containerPort = var.app_port
        hostPort      = var.app_port
    }]
    environment = [
      {
        name  = "NODE_ENV"
        value = "production"
      },
      {
        name  = "APP_ENV"
        value = var.environment
      },
      {
        name  = "FARGATE"
        value = "1"
      },
      {
        name  = "API_BASE_URL"
        value = "https://${local.oidc_api_fqdn}"
      },
      {
        name  = "FRONTEND_API_BASE_URL"
        value = "https://${local.frontend_api_fqdn}/"
      },
      {
        name  = "API_KEY"
        value = local.api_key
      },
      {
        name  = "ACCOUNT_MANAGEMENT_URL"
        value = "https://${local.account_management_fqdn}"
      },
      {
        name  = "BASE_URL"
        value = aws_route53_record.frontend.name
      },
      {
        name  = "SESSION_EXPIRY"
        value = var.session_expiry
      },
      {
        name  = "SESSION_SECRET"
        value = random_string.session_secret.result
      },
      {
        name  = "GTM_ID"
        value = var.gtm_id
      },
      {
        name  = "ANALYTICS_COOKIE_DOMAIN"
        value = local.service_domain
      },
      {
        name  = "REDIS_KEY"
        value = local.redis_key
      },
      {
        name  = "SUPPORT_INTERNATIONAL_NUMBERS"
        value = var.support_international_numbers
      },
      {
        name  = "ZENDESK_API_TOKEN"
        value = var.zendesk_api_token
      },
      {
        name  = "ZENDESK_GROUP_ID_PUBLIC"
        value = var.zendesk_group_id_public
      },
      {
        name  = "ZENDESK_USERNAME"
        value = var.zendesk_username
      },
    ]
  }

  sidecar_container_definition = {
    name      = "nginx-sidecar"
    image     = "${var.sidecar_image_uri}:${var.sidecar_image_tag}@${var.sidecar_image_digest}"
    essential = true
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.ecs_frontend_task_log.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = local.service_name
      }
    }
    portMappings = [
      {
        protocol      = "tcp"
        containerPort = local.nginx_port
        hostPort      = local.nginx_port
    }]
    environment = [
      {
        name  = "BASIC_AUTH_USERNAME"
        value = var.basic_auth_username
      },
      {
        name  = "BASIC_AUTH_PASSWORD"
        value = var.basic_auth_password
      },
      {
        name  = "PROXY_PASS"
        value = "http://localhost:${var.app_port}"
      },
      {
        name  = "NGINX_PORT"
        value = "8080"
      },
      {
        name  = "NGINX_HOST"
        value = local.frontend_fqdn
      },
      {
        name  = "IP_ALLOW_LIST"
        value = length(var.basic_auth_bypass_cidr_blocks) == 0 ? "" : jsonencode(var.basic_auth_bypass_cidr_blocks)
      },
      {
        name  = "TRUSTED_PROXIES"
        value = jsonencode(local.public_subnet_cidr_blocks)
      },
    ]
  }
}

resource "random_string" "session_secret" {
  length  = 32
  special = false
}

resource "aws_ecs_service" "frontend_ecs_service" {
  name            = local.service_name
  cluster         = local.cluster_id
  task_definition = aws_ecs_task_definition.frontend_task_definition.arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = var.deployment_min_healthy_percent
  deployment_maximum_percent         = var.deployment_max_percent
  health_check_grace_period_seconds  = var.health_check_grace_period_seconds

  network_configuration {
    security_groups = [
      local.allow_egress_security_group_id,
      local.allow_aws_service_access_security_group_id,
      aws_security_group.frontend_ecs_tasks_sg.id,
      aws_security_group.allow_access_to_frontend_redis.id,
    ]
    subnets          = local.private_subnet_ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.frontend_alb_target_group.arn
    container_name   = var.basic_auth_password == "" ? local.frontend_container_definition.name : local.sidecar_container_definition.name
    container_port   = local.application_port
  }

  tags = local.default_tags
}

resource "aws_ecs_task_definition" "frontend_task_definition" {
  family                   = "${var.environment}-frontend-ecs-task-definition"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.frontend_task_definition_cpu
  memory                   = var.frontend_task_definition_memory
  container_definitions = var.basic_auth_password == "" ? jsonencode([local.frontend_container_definition]) : jsonencode([
    local.frontend_container_definition,
    local.sidecar_container_definition,
  ])

  tags = local.default_tags
}
