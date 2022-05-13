
resource "aws_appautoscaling_target" "frontend_auto_scaling_target" {
  count              = var.frontend_auto_scaling_enabled ? 1 : 0
  min_capacity       = var.frontend_auto_scaling_min_count
  max_capacity       = var.frontend_auto_scaling_max_count
  resource_id        = "service/${var.environment}-app-cluster/${aws_ecs_service.frontend_ecs_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "frontend_auto_scaling_policy_memory" {
  count              = var.frontend_auto_scaling_enabled ? 1 : 0
  name               = "${var.environment}-frontend_auto_scaling_policy_memory"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.frontend_auto_scaling_target[0].resource_id
  scalable_dimension = aws_appautoscaling_target.frontend_auto_scaling_target[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend_auto_scaling_target[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = var.frontend_auto_scaling_policy_memory_target
    scale_out_cooldown = var.frontend_auto_scaling_policy_scale_out_cooldown
    scale_in_cooldown  = var.frontend_auto_scaling_policy_scale_in_cooldown
  }
}

resource "aws_appautoscaling_policy" "frontend_auto_scaling_policy_cpu" {
  count              = var.frontend_auto_scaling_enabled ? 1 : 0
  name               = "${var.environment}-frontend_auto_scaling_policy_cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.frontend_auto_scaling_target[0].resource_id
  scalable_dimension = aws_appautoscaling_target.frontend_auto_scaling_target[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend_auto_scaling_target[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.frontend_auto_scaling_policy_cpu_target
    scale_out_cooldown = var.frontend_auto_scaling_policy_scale_out_cooldown
    scale_in_cooldown  = var.frontend_auto_scaling_policy_scale_in_cooldown
  }
}