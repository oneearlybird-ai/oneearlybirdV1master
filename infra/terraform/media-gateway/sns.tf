resource "aws_sns_topic" "media_alarms" {
  name = "media-ws-alarms"
  tags = var.tags
}

resource "aws_sns_topic_subscription" "sms_primary" {
  topic_arn = aws_sns_topic.media_alarms.arn
  protocol  = "sms"
  endpoint  = "+17034397095"
}

