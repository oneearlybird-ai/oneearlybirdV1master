resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "media-alb-5xx-errors"
  alarm_description   = "ALB 5XX errors > 0 over 5 minutes"
  namespace           = "AWS/ApplicationELB"
  metric_name         = "HTTPCode_ELB_5XX_Count"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  dimensions = {
    LoadBalancer = aws_lb.media_alb.arn_suffix
  }
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "tg_unhealthy" {
  alarm_name          = "media-tg-unhealthy-hosts"
  alarm_description   = "Any target becomes unhealthy"
  namespace           = "AWS/ApplicationELB"
  metric_name         = "UnHealthyHostCount"
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 1
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  dimensions = {
    TargetGroup = aws_lb_target_group.media_tg.arn_suffix
    LoadBalancer = aws_lb.media_alb.arn_suffix
  }
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "alb_p95_latency" {
  alarm_name          = "media-alb-target-p95-latency"
  alarm_description   = "TargetResponseTime p95 > 2.0s for 3 minutes"
  namespace           = "AWS/ApplicationELB"
  metric_name         = "TargetResponseTime"
  extended_statistic  = "p95"
  period              = 60
  evaluation_periods  = 3
  threshold           = 2.0
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  dimensions = {
    LoadBalancer = aws_lb.media_alb.arn_suffix
  }
  tags = var.tags
}

