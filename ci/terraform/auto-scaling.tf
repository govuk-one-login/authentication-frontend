
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

resource "aws_cloudwatch_metric_alarm" "ecs_service_scale_out_alarm" {
  count               = var.frontend_auto_scaling_v2_enabled ? 1 : 0
  alarm_name          = "${var.environment}-app-cluster/${aws_ecs_service.frontend_ecs_service.name}-AlarmScaleUp"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 60
  datapoints_to_alarm = 2

  dimensions = {
    ClusterName = "${var.environment}-app-cluster"
    ServiceName = "${aws_ecs_service.frontend_ecs_service.name}"
  }

  alarm_description = "Metric alarm to trigger ECS scale up"
  alarm_actions     = [aws_appautoscaling_policy.frontend_auto_scaling_policy_scale_out[0].arn]
}

resource "aws_cloudwatch_metric_alarm" "ecs_service_scale_in_alarm" {
  count               = var.frontend_auto_scaling_v2_enabled ? 1 : 0
  alarm_name          = "${var.environment}-app-cluster/${aws_ecs_service.frontend_ecs_service.name}-AlarmScaleDown"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 5
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 60
  datapoints_to_alarm = 5

  dimensions = {
    ClusterName = "${var.environment}-app-cluster"
    ServiceName = "${aws_ecs_service.frontend_ecs_service.name}"
  }

  alarm_description = "Metric alarm to trigger ECS scale down"
  alarm_actions     = [aws_appautoscaling_policy.frontend_auto_scaling_policy_scale_in[0].arn]
}

resource "aws_appautoscaling_target" "frontend_auto_scaling_target_v2" {
  count              = var.frontend_auto_scaling_v2_enabled ? 1 : 0
  min_capacity       = var.frontend_auto_scaling_min_count
  max_capacity       = var.frontend_auto_scaling_max_count
  resource_id        = "service/${var.environment}-app-cluster/${aws_ecs_service.frontend_ecs_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "frontend_auto_scaling_policy_scale_out" {
  count              = var.frontend_auto_scaling_v2_enabled ? 1 : 0
  name               = "${var.environment}-frontend_auto_scaling_policy_scale_in"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.frontend_auto_scaling_target_v2[0].resource_id
  scalable_dimension = aws_appautoscaling_target.frontend_auto_scaling_target_v2[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend_auto_scaling_target_v2[0].service_namespace

  step_scaling_policy_configuration {
    adjustment_type          = "PercentChangeInCapacity"
    metric_aggregation_type  = "Average"
    cooldown                 = 120
    min_adjustment_magnitude = 5

    step_adjustment {
      metric_interval_lower_bound = 20
      metric_interval_upper_bound = 30
      scaling_adjustment          = 200
    }

    step_adjustment {
      metric_interval_lower_bound = 30
      metric_interval_upper_bound = 35
      scaling_adjustment          = 300
    }

    step_adjustment {
      metric_interval_lower_bound = 35
      scaling_adjustment          = 500
    }
  }
}

resource "aws_appautoscaling_policy" "frontend_auto_scaling_policy_scale_in" {
  count              = var.frontend_auto_scaling_v2_enabled ? 1 : 0
  name               = "${var.environment}-frontend_auto_scaling_policy_scale_in"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.frontend_auto_scaling_target_v2[0].resource_id
  scalable_dimension = aws_appautoscaling_target.frontend_auto_scaling_target_v2[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend_auto_scaling_target_v2[0].service_namespace

  step_scaling_policy_configuration {
    adjustment_type          = "PercentChangeInCapacity"
    metric_aggregation_type  = "Average"
    cooldown                 = 120
    min_adjustment_magnitude = 5

    step_adjustment {
      metric_interval_upper_bound = -40
      scaling_adjustment          = -50
    }
  }
}
