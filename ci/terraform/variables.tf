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

variable "paas_frontend_cdn_route_destination" {
  type        = string
  description = "The Cloudfront instance to forward all PaaS requests to"
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