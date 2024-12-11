data "aws_iam_policy_document" "ecs_assume_role_policy" {
  statement {
    sid    = ""
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "${var.environment}-frontend-ecs-task-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy_attachment_dynatrace_paas_token" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.dynatrace_policy.arn
}

resource "aws_iam_role" "ecs_task_role" {
  name               = "${var.environment}-frontend-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "account_management_ecs_task_role_ssm_policy_attachment" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.parameter_policy.arn
}


####### Service Down ECS role #######

data "aws_iam_policy_document" "service_down_ecs_assume_role_policy" {
  count = var.service_down_page ? 1 : 0
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "service_down_ecs_task_execution_role" {
  count              = var.service_down_page ? 1 : 0
  name_prefix        = "${var.environment}-service-down-page-exec-"
  assume_role_policy = data.aws_iam_policy_document.service_down_ecs_assume_role_policy[0].json

  tags = {
    Service = "service-down-page"
  }
}

resource "aws_iam_role_policy_attachment" "service_down_ecs_task_execution_role_policy_attachment" {
  count      = var.service_down_page ? 1 : 0
  role       = aws_iam_role.service_down_ecs_task_execution_role[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
