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
        name  = "REDIS_KEY"
        value = local.redis_key
      },
      {
        name  = "SUPPORT_AUTHORIZE_CONTROLLER"
        value = var.support_authorize_controller
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
        name  = "ORCH_STUB_TO_AUTH_SIGNING_KEY"
        value = var.orch_stub_to_auth_signing_public_key
      },
      {
        name  = "ORCH_STUB_TO_AUTH_CLIENT_ID"
        value = var.orch_stub_to_auth_client_id
      },
      {
        name  = "ORCH_STUB_TO_AUTH_AUDIENCE"
        value = var.orch_stub_to_auth_audience
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
        name  = "URL_FOR_SUPPORT_LINKS"
        value = var.url_for_support_links
      },
      {
        name  = "SERVICE_DOMAIN"
        value = local.service_domain
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
      {
        name  = "REDUCED_CODE_BLOCK_DURATION_MINUTES"
        value = var.reduced_code_block_duration_minutes
      },
      {
        name  = "SUPPORT_ACCOUNT_INTERVENTIONS"
        value = var.support_account_interventions
      },
      {
        name  = "SUPPORT_REAUTHENTICATION"
        value = var.support_reauthentication
      },
      {
        name  = "NO_PHOTO_ID_CONTACT_FORMS"
        value = var.no_photo_id_contact_forms
      },
      {
        name  = "SUPPORT_CHECK_EMAIL_FRAUD"
        value = var.support_check_email_fraud
      },
      {
        name  = "DEFAULT_CHANNEL"
        value = var.default_channel
      },
      {
        name  = "LANGUAGE_TOGGLE_ENABLED"
        value = var.language_toggle_enabled
      },
      {
        name  = "PROVE_IDENTITY_WELCOME_ENABLED"
        value = var.prove_identity_welcome_enabled
      },
      {
        name  = "GA4_ENABLED"
        value = var.ga4_enabled
      },
      {
        name  = "UA_ENABLED"
        value = var.ua_enabled
      },
      {
        name  = "UNIVERSAL_ANALYTICS_GTM_CONTAINER_ID"
        value = var.universal_analytics_gtm_container_id
      },
      {
        name  = "GOOGLE_ANALYTICS_4_GTM_CONTAINER_ID"
        value = var.google_analytics_4_gtm_container_id
      },
      {
        name  = "ANALYTICS_COOKIE_DOMAIN"
        value = var.analytics_cookie_domain
      },
      {
        name  = "SUPPORT_NEW_IPV_SPINNER"
        value = var.support_new_ipv_spinner
      },
      {
        name  = "SUPPORT_HTTP_KEEP_ALIVE"
        value = var.support_http_keep_alive
      },
      {
        name  = "SUPPORT_MFA_RESET_WITH_IPV"
        value = var.support_mfa_reset_with_ipv
      }
    ]

    secrets = [
      {
        name      = "DT_TENANT"
        valueFrom = "${var.dynatrace_secret_arn}:DT_TENANT::"
      },
      {
        name      = "DT_TENANTTOKEN"
        valueFrom = "${var.dynatrace_secret_arn}:DT_TENANTTOKEN::"
      },
      {
        name      = "DT_CONNECTION_POINT"
        valueFrom = "${var.dynatrace_secret_arn}:DT_CONNECTION_POINT::"
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

  tags = local.default_tags
}



###### ECS Service Down ######

locals {
  service_down_page_service_name   = "${var.environment}-service-down-page-service"
  service_down_page_app_port       = 8080
  service_down_page_container_name = "service-down-page"
}

resource "aws_ecs_service" "service_down_ecs_service" {
  count           = var.service_down_page ? 1 : 0
  name            = local.service_down_page_service_name
  cluster         = local.cluster_id
  task_definition = aws_ecs_task_definition.service_down_page_task_definition[0].arn
  desired_count   = 2
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 100

  network_configuration {
    security_groups = [
      aws_security_group.service_down_page[0].id,
      local.allow_aws_service_access_security_group_id,
    ]
    subnets          = local.private_subnet_ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.frontend_service_down_alb_target_group[0].arn
    container_name   = local.service_down_page_container_name
    container_port   = local.service_down_page_app_port
  }

  tags = local.default_tags

  depends_on = [
    aws_alb_listener_rule.service_down_rule[0],
  ]
}

resource "aws_ecs_task_definition" "service_down_page_task_definition" {
  count                    = var.service_down_page ? 1 : 0
  family                   = "${var.environment}-frontend-service-down-page-ecs-task-definition"
  execution_role_arn       = aws_iam_role.service_down_ecs_task_execution_role[0].arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  container_definitions = jsonencode([
    {
      name      = local.service_down_page_container_name
      image     = "${var.service_down_image_uri}:${var.service_down_image_tag}@${var.service_down_image_digest}"
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.service_down_page[0].name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = local.service_down_page_container_name
        }
      }
      portMappings = [
        {
          protocol      = "tcp"
          containerPort = local.service_down_page_app_port
          hostPort      = local.service_down_page_app_port
      }]
  }])

  tags = local.default_tags
}

resource "aws_cloudwatch_log_group" "service_down_page" {
  count = var.service_down_page ? 1 : 0
  name  = "/ecs/${var.environment}-service-down-page"

  retention_in_days = 1
}
