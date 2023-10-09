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
        name  = "SUPPORT_ACCOUNT_RECOVERY"
        value = var.support_account_recovery
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
        name  = "SUPPORT_LANGUAGE_CY"
        value = var.support_language_cy
      },
      {
        name  = "SUPPORT_AUTH_ORCH_SPLIT"
        value = var.support_auth_orch_split
      },
      {
        name  = "ENCRYPTION_KEY_ID"
        value = "alias/${var.environment}-authentication-encryption-key-alias"
      },
      {
        name  = "ORCH_TO_AUTH_SIGNING_KEY"
        value = var.orch_to_auth_signing_public_key
      },
      {
        name  = "ORCH_TO_AUTH_CLIENT_ID"
        value = var.orch_to_auth_client_id
      },
      {
        name  = "ORCH_TO_AUTH_AUDIENCE"
        value = var.orch_to_auth_audience
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
      {
        name  = "SUPPORT_SMART_AGENT"
        value = var.support_smart_agent
      },
      {
        name  = "SMARTAGENT_API_KEY"
        value = var.smartagent_api_key
      },
      {
        name  = "SMARTAGENT_API_URL"
        value = var.smartagent_api_url
      },
      {
        name  = "SMARTAGENT_WEBFORM_ID"
        value = var.smartagent_webform_id
      },
      {
        name  = "SERVICE_DOMAIN"
        value = local.service_domain
      },
      {
        name  = "SUPPORT_WELSH_LANGuAGE_IN_SUPPORT_FORMS"
        value = var.support_welsh_language_in_support_forms
      },
      {
        name  = "PASSWORD_RESET_CODE_ENTERED_WRONG_BLOCKED_MINUTES"
        value = var.password_reset_code_entered_wrong_blocked_minutes
      },
      {
        name  = "ACCOUNT_RECOVERY_CODE_ENTERED_WRONG_BLOCKED_MINUTES"
        value = var.account_recovery_code_entered_wrong_blocked_minutes
      },
      {
        name  = "CODE_REQUEST_BLOCKED_MINUTES"
        value = var.code_request_blocked_minutes
      },
      {
        name  = "CODE_ENTERED_WRONG_BLOCKED_MINUTES"
        value = var.code_entered_wrong_blocked_minutes
      },
    ]

    mountPoints = [
      {
        sourceVolume  = "oneagent"
        containerPath = "/opt/dynatrace/oneagent"
      }
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

  oneagent_installer_container_definition = {
    name      = "oneagent-installer"
    image     = "${data.aws_caller_identity.current.account_id}.dkr.ecr.eu-west-2.amazonaws.com/ecr-public/docker/library/alpine:3"
    essential = false

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.ecs_frontend_task_log.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = local.service_name
      }
    }

    entrypoint = ["/bin/sh", "-c"]
    command    = ["ARCHIVE=$(mktemp) && wget -O $ARCHIVE \"$DT_API_URL/v1/deployment/installer/agent/unix/paas/latest?Api-Token=$DT_PAAS_TOKEN&$DT_ONEAGENT_OPTIONS\" && unzip -o -d /opt/dynatrace/oneagent $ARCHIVE && rm -f $ARCHIVE"]

    environment = [
      {
        name  = "DT_API_URL",
        value = "https://khw46367.live.dynatrace.com/api"
      },
      {
        name  = "DT_ONEAGENT_OPTIONS",
        value = "flavor=musl&include=all"
      }
    ]

    secrets = [
      {
        name      = "DT_PAAS_TOKEN"
        valueFrom = data.aws_secretsmanager_secret.dynatrace_paas_token.arn
      }
    ]

    mountPoints = [
      {
        sourceVolume  = "oneagent"
        containerPath = "/opt/dynatrace/oneagent"
      }
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

  lifecycle {
    ignore_changes = [desired_count]
  }

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
  container_definitions = var.basic_auth_password == "" ? jsonencode([
    local.frontend_container_definition,
    ]) : jsonencode([
    local.frontend_container_definition,
    local.sidecar_container_definition,
  ])

  volume {
    name = "oneagent"
  }

  tags = local.default_tags
}
