variable "aws_region" {
  default = "eu-west-2"
}

variable "deployer_role_arn" {
  default = null
}

variable "environment" {
  description = "the name of the environment being deployed (e.g. sandpit, build), this also matches the PaaS space name"
}

variable "common_state_bucket" {
}

variable "redis_node_size" {
  default = "cache.t2.small"
}

variable "service_domain" {
  default = null
}

variable "support_account_recovery" {
  type = string
}

variable "support_international_numbers" {
  type = string
}

variable "support_welsh_language_in_support_forms" {
  type    = string
  default = "0"
}

variable "support_language_cy" {
  type = string
}

variable "support_auth_orch_split" {
  type    = string
  default = "0"
}

variable "support_smart_agent" {
  type    = string
  default = "0"
}

variable "image_uri" {
  type = string
}

variable "image_tag" {
  type    = string
  default = "latest"
}

variable "image_digest" {
  type = string
}

variable "ecs_desired_count" {
  type    = number
  default = 2
}

variable "frontend_task_definition_cpu" {
  type    = number
  default = 1024
}

variable "frontend_task_definition_memory" {
  type    = number
  default = 2048
}

variable "frontend_auto_scaling_enabled" {
  default = false
}

variable "frontend_auto_scaling_min_count" {
  type    = number
  default = 2
}

variable "frontend_auto_scaling_max_count" {
  type    = number
  default = 4
}

variable "frontend_auto_scaling_policy_memory_target" {
  type    = number
  default = 75
}

variable "frontend_auto_scaling_policy_cpu_target" {
  type    = number
  default = 65
}

variable "frontend_auto_scaling_policy_scale_out_cooldown" {
  type    = number
  default = 120
}

variable "frontend_auto_scaling_policy_scale_in_cooldown" {
  type    = number
  default = 300
}

variable "app_port" {
  type    = number
  default = 3000
}

variable "session_expiry" {
  type = string
}

variable "gtm_id" {
  type = string
}

variable "cloudwatch_log_retention" {
  default = 1
  type    = number
}

variable "logging_endpoint_arns" {
  type        = list(string)
  default     = []
  description = "Amazon Resource Name (ARN) for the CSLS endpoints to ship logs to"
}

variable "smartagent_webform_id" {
  type = string
}

variable "smartagent_api_key" {
  type = string
}

variable "smartagent_api_url" {
  type = string
}

variable "zendesk_username" {
  type    = string
  default = ""
}

variable "zendesk_group_id_public" {
  type    = string
  default = ""
}

variable "zendesk_api_token" {
  type    = string
  default = ""
}

variable "deployment_min_healthy_percent" {
  default = 50
}

variable "deployment_max_percent" {
  default = 150
}

variable "health_check_grace_period_seconds" {
  default = 15
}

variable "deregistration_delay" {
  default = 30
}

variable "sidecar_image_uri" {
  default = ""
}
variable "sidecar_image_tag" {
  default = "latest"
}
variable "sidecar_image_digest" {
  default = ""
}
variable "basic_auth_username" {
  default = ""
}
variable "basic_auth_password" {
  default = ""
}

variable "incoming_traffic_cidr_blocks" {
  default     = ["0.0.0.0/0"]
  type        = list(string)
  description = "The list of CIDR blocks allowed to send requests to the ALB"
}

variable "basic_auth_bypass_cidr_blocks" {
  default     = []
  type        = list(string)
  description = "The list of CIDR blocks allowed to bypass basic auth (if enabled)"
}

variable "password_reset_code_entered_wrong_blocked_minutes" {
  default     = "15"
  description = "The duration, in minutes, for which a user is blocked after entering the wrong password reset code multiple times"
}

variable "account_recovery_code_entered_wrong_blocked_minutes" {
  default     = "15"
  description = "The duration, in minutes, for which a user is blocked after entering the wrong account recovery code multiple times"
}

variable "code_request_blocked_minutes" {
  default     = "15"
  description = "The duration, in minutes, for which a user is blocked after requesting the wrong code multiple times"
}

variable "code_entered_wrong_blocked_minutes" {
  default     = "15"
  description = "The duration, in minutes, for which a user is blocked after entering the wrong code multiple times"
}

variable "orch_to_auth_signing_public_key" {
  description = "Public key counterpart for KMS key created in Orchestration/OIDC API"
  type        = string
  default     = ""
}

variable "orch_to_auth_client_id" {
  description = "Client ID that is used by OIDC API when making authorize redirect to Auth Frontend"
  type        = string
  default     = ""
}

variable "orch_to_auth_audience" {
  description = "Aud value included in JWT by OIDC API when making authorize redirect to Auth Frontend"
  type        = string
  default     = ""
}
