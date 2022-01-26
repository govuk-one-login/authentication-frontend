variable "aws_region" {
  default = "eu-west-2"
}

variable "deployer_role_arn" {
  default = null
}

variable "cf_username" {
  description = "deployer username"
}

variable "cf_password" {
  description = "deployer password org"
}

variable "cf_org_name" {
  description = "target org"
}

variable "environment" {
  description = "the name of the environment being deployed (e.g. sandpit, build), this also matches the PaaS space name"
}

variable "redis_service_plan" {
  type        = string
  default     = "tiny-5_x"
  description = "The PaaS service plan (instance size) to use for Redis. For a full list of options, run 'cf marketplace -e redis'"
}

variable "common_state_bucket" {
}

variable "redis_node_size" {
  default = "cache.t2.small"
}
