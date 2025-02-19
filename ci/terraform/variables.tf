variable "aws_region" {
  default = "eu-west-2"
  type    = string
}

variable "deployer_role_arn" {
  default = null
  type    = string
}

variable "environment" {
  description = "the name of the environment being deployed (e.g. sandpit, build), this also matches the PaaS space name"
  type        = string
}

variable "common_state_bucket" {
  type = string
}

variable "redis_node_size" {
  default = "cache.t2.small"
  type    = string
}

variable "support_account_recovery" {
  type = string
}

variable "support_authorize_controller" {
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

variable "frontend_auto_scaling_v2_enabled" {
  default = false
  type    = bool
}

variable "frontend_auto_scaling_min_count" {
  type    = number
  default = 2
}

variable "frontend_auto_scaling_max_count" {
  type    = number
  default = 4
}

variable "app_port" {
  type    = number
  default = 3000
}

variable "session_expiry" {
  type = string
}

variable "cloudwatch_log_retention" {
  default = 30
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

variable "url_for_support_links" {
  type    = string
  default = "/contact-us"
}

variable "deployment_min_healthy_percent" {
  default = 50
  type    = number
}

variable "deployment_max_percent" {
  default = 150
  type    = number
}

variable "health_check_grace_period_seconds" {
  default = 15
  type    = number
}

variable "deregistration_delay" {
  default = 90
  type    = number
}

variable "service_down_image_uri" {
  type = string
}

variable "service_down_image_tag" {
  type    = string
  default = "latest"
}

variable "service_down_image_digest" {
  type = string
}

variable "incoming_traffic_cidr_blocks" {
  default     = ["0.0.0.0/0"]
  type        = list(string)
  description = "The list of CIDR blocks allowed to send requests to the ALB"
}

variable "new_auth_account_id" {
  description = "New Auth account id for equivalent environment"
  default     = ""
  type        = string
}

variable "new_auth_protectedsub_cidr_blocks" {
  type        = list(string)
  default     = []
  description = "New Auth equivalent environment protected subnets"
}

variable "password_reset_code_entered_wrong_blocked_minutes" {
  default     = "15"
  description = "The duration, in minutes, for which a user is blocked after entering the wrong password reset code multiple times"
  type        = string
}

variable "account_recovery_code_entered_wrong_blocked_minutes" {
  default     = "15"
  description = "The duration, in minutes, for which a user is blocked after entering the wrong account recovery code multiple times"
  type        = string
}

variable "code_request_blocked_minutes" {
  default     = "15"
  description = "The duration, in minutes, for which a user is blocked after requesting the wrong code multiple times"
  type        = string
}

variable "code_entered_wrong_blocked_minutes" {
  default     = "15"
  description = "The duration, in minutes, for which a user is blocked after entering the wrong code multiple times"
  type        = string
}

variable "reduced_code_block_duration_minutes" {
  default     = "15"
  description = "The reduced duration, in minutes, for certain scenarios which a user is blocked after entering the wrong code multiple times"
  type        = string
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

variable "orch_stub_to_auth_signing_public_key" {
  description = "Public key counterpart for KMS key created in Orchestration/OIDC API"
  type        = string
  default     = ""
}

variable "orch_stub_to_auth_client_id" {
  description = "Client ID that is used by OIDC API when making authorize redirect to Auth Frontend"
  type        = string
  default     = ""
}

variable "orch_stub_to_auth_audience" {
  description = "Aud value included in JWT by OIDC API when making authorize redirect to Auth Frontend"
  type        = string
  default     = ""
}

variable "dynatrace_secret_arn" {
  type = string
}

variable "no_photo_id_contact_forms" {
  description = "When true enables no photo id contact forms"
  type        = string
  default     = "0"
}

variable "support_account_interventions" {
  description = "When true, turns on account interventions in environment"
  type        = string
  default     = "0"
}

variable "support_reauthentication" {
  description = "When true, turns on re-authentication in environment"
  type        = string
  default     = "0"
}

variable "support_check_email_fraud" {
  description = "When true enables Fraudulent email checking via Experian lockout"
  type        = string
  default     = "1"
}

variable "default_channel" {
  description = "To set the default channel."
  type        = string
  default     = "web"
}

variable "prove_identity_welcome_enabled" {
  description = "Do not show the prove identity welcome screen when disabled"
  type        = string
  default     = "0"
}

variable "alb_idle_timeout" {
  description = "Frontend Application Load Balancer idle timeout"
  default     = 60
  type        = number
}

variable "ip_endpoint_rate_limiting_configuration" {
  description = "Configuration to rate limit endpoints by IP"
  type = list(object({
    endpoints             = list(string)
    evaluation_window_sec = number
    limit                 = number
  }))

  default = []

  validation {
    condition     = length(var.ip_endpoint_rate_limiting_configuration) <= 9
    error_message = "There can be at most 9 configurations"
  }

  validation {
    condition     = length(var.ip_endpoint_rate_limiting_configuration) == 0 || alltrue([for config in var.ip_endpoint_rate_limiting_configuration : length(config.endpoints) > 0])
    error_message = "Each object in the list must have more than 0 endpoints."
  }
  validation {
    condition     = length(var.ip_endpoint_rate_limiting_configuration) == 0 || alltrue([for config in var.ip_endpoint_rate_limiting_configuration : contains([60, 120, 300, 600], config.evaluation_window_sec)])
    error_message = "evaluation_window_sec must be one of 60, 120, 300, or 600."
  }
  validation {
    condition     = length(var.ip_endpoint_rate_limiting_configuration) == 0 || alltrue([for config in var.ip_endpoint_rate_limiting_configuration : config.limit >= 10])
    error_message = "limit must be >= 10."
  }
}

variable "aps_session_endpoint_rate_limiting_configuration" {
  description = "Configuration to rate limit endpoints by aps cookie value"
  type = list(object({
    endpoints             = list(string)
    evaluation_window_sec = number
    limit                 = number
  }))

  default = []

  validation {
    condition     = length(var.aps_session_endpoint_rate_limiting_configuration) <= 9
    error_message = "There can be at most 9 configurations"
  }

  validation {
    condition     = length(var.aps_session_endpoint_rate_limiting_configuration) == 0 || alltrue([for config in var.aps_session_endpoint_rate_limiting_configuration : length(config.endpoints) > 0])
    error_message = "Each object in the list must have more than 0 endpoints."
  }
  validation {
    condition     = length(var.aps_session_endpoint_rate_limiting_configuration) == 0 || alltrue([for config in var.aps_session_endpoint_rate_limiting_configuration : contains([60, 120, 300, 600], config.evaluation_window_sec)])
    error_message = "evaluation_window_sec must be one of 60, 120, 300, or 600."
  }
  validation {
    condition     = length(var.aps_session_endpoint_rate_limiting_configuration) == 0 || alltrue([for config in var.aps_session_endpoint_rate_limiting_configuration : config.limit >= 10])
    error_message = "limit must be >= 10."
  }
}

variable "service_down_page" {
  type        = bool
  default     = false
  description = "Feature flag to control deployment of service down page "
}

variable "cloudfront_zoneid" {
  type        = string
  default     = "Z2FDTNDATAQYW2"
  description = "This global zone id of  CloudFront distribution "
}

variable "auth_origin_cloakingheader" {
  type        = string
  description = "This is header value for Cloufront to to verify requests are coming from the correct CloudFront distribution to ALB "
}


variable "previous_auth_origin_cloakingheader" {
  type        = string
  description = "This is previous header value when the value is rotated to ensure WAF will allow requests during rotation "
}

variable "Add_WWWPrefix" {
  type        = bool
  default     = false
  description = "flag to to add subdomain (www) to the frontend url eg www.signin.sandpit.account.gov.uk"
}

variable "Fraud_Header_Enabled" {
  type        = bool
  default     = true
  description = "flag to switch on Fraud header on cloudfront disturbution"
}

variable "cloudfront_WafAcl_Logdestination" {
  type        = string
  default     = "none"
  description = "CSLS logging destinatiin for logging Cloufront CloakingOriginWebACL WAf logs "
}
#end of cloudfront variable

variable "language_toggle_enabled" {
  type        = string
  default     = "0"
  description = "Enables English / Welsh language toggle in the user interface"
}

variable "ga4_enabled" {
  type        = string
  default     = "false"
  description = "Enables Google Analytics 4"
}

variable "google_analytics_4_gtm_container_id" {
  type        = string
  default     = "GTM-KD86CMZ"
  description = "Google Analytics 4 Container ID"
}

variable "analytics_cookie_domain" {
  type        = string
  default     = ""
  description = "Analytics cookie domain where cookie is set"
}

variable "support_new_ipv_spinner" {
  type        = string
  default     = "0"
  description = "Enables the new IPV spinner page"
}

variable "support_http_keep_alive" {
  type        = string
  default     = "0"
  description = "Switch on http keep alive for axios"
}

variable "support_mfa_reset_with_ipv" {
  type        = string
  default     = "0"
  description = "Switch to support the IPV prove identity journey when resetting the mfa"
}

variable "vpc_environment" {
  description = "The name of the environment this environment is sharing the VPC , this var is only for Authdevs env and must be overide using Authdevs.tfvars, default value should be null always."
  type        = string
  default     = null
}
