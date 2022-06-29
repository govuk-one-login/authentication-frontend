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

variable "dns_state_bucket" {
  default = ""
}

variable "dns_state_key" {
  default = ""
}

variable "dns_state_role" {
  default = ""
}

variable "account_management_fqdn" {
  default = null
}

variable "oidc_api_fqdn" {
  default = null
}

variable "frontend_fqdn" {
  default = null
}

variable "service_domain" {
  default = null
}

variable "support_international_numbers" {
  type = string
}

variable "zone_id" {
  default = null
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

variable "logging_endpoint_arn" {
  default = ""
}

variable "logging_endpoint_enabled" {
  type        = bool
  default     = false
  description = "Whether the service should ship its Lambda logs to the `logging_endpoint_arn`"
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

variable "frontend_api_fqdn" {
  default = null
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