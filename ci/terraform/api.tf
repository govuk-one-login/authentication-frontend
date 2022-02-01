data "terraform_remote_state" "api" {
  backend = "s3"
  config = {
    bucket   = var.common_state_bucket
    key      = "${var.environment}-terraform.tfstate"
    role_arn = var.deployer_role_arn
    region   = var.aws_region
  }
}

locals {
  api_key = data.terraform_remote_state.api.outputs.frontend_api_key
}
