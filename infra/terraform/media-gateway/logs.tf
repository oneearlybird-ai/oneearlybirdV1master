resource "aws_cloudwatch_log_group" "syslog" {
  name              = "/media-ws/syslog"
  retention_in_days = 14
  tags              = var.tags
}

resource "aws_cloudwatch_log_group" "user_data" {
  name              = "/media-ws/user-data"
  retention_in_days = 14
  tags              = var.tags
}

