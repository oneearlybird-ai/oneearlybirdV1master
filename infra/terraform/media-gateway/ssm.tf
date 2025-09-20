data "aws_kms_alias" "ssm" {
  name = "alias/aws/ssm"
}

resource "aws_ssm_parameter" "media_auth_token" {
  name        = "/oneearlybird/media/MEDIA_AUTH_TOKEN"
  description = "Media gateway WS auth token for media.oneearlybird.ai"
  type        = "SecureString"
  key_id      = data.aws_kms_alias.ssm.target_key_arn
  value       = var.media_auth_token
  tags        = var.tags
}

