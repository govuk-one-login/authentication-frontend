
# stepscaling frontend_auto_scaling_*_v2 after performance testing


resource "aws_cloudwatch_metric_alarm" "ecs_service_scale_out_alarm" {
  count               = var.frontend_auto_scaling_v2_enabled ? 1 : 0
  alarm_name          = "${var.environment}-app-cluster/${aws_ecs_service.frontend_ecs_service.name}-AlarmScaleUp"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 50
  datapoints_to_alarm = 1

  dimensions = {
    ClusterName = "${var.environment}-app-cluster"
    ServiceName = aws_ecs_service.frontend_ecs_service.name
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
  threshold           = 40
  datapoints_to_alarm = 5

  dimensions = {
    ClusterName = "${var.environment}-app-cluster"
    ServiceName = aws_ecs_service.frontend_ecs_service.name
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
  name               = "${var.environment}-frontend_auto_scaling_policy_scale_out"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.frontend_auto_scaling_target_v2[0].resource_id
  scalable_dimension = aws_appautoscaling_target.frontend_auto_scaling_target_v2[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend_auto_scaling_target_v2[0].service_namespace

  step_scaling_policy_configuration {
    adjustment_type          = "PercentChangeInCapacity"
    metric_aggregation_type  = "Average"
    cooldown                 = 60
    min_adjustment_magnitude = 10

    step_adjustment {
      metric_interval_lower_bound = 0
      metric_interval_upper_bound = 10
      scaling_adjustment          = 300
    }

    step_adjustment {
      metric_interval_lower_bound = 10
      metric_interval_upper_bound = 30
      scaling_adjustment          = 600
    }

    step_adjustment {
      metric_interval_lower_bound = 30
      scaling_adjustment          = 1000
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
    cooldown                 = 300
    min_adjustment_magnitude = 5

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -25
    }
  }

}
