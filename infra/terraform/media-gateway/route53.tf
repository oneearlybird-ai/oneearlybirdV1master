variable "create_media_zone" {
  description = "Create a Route53 public hosted zone for media subdomain"
  type        = bool
  default     = false
}

variable "media_subdomain" {
  description = "Subdomain to host in Route53 (e.g., media.oneearlybird.ai)"
  type        = string
  default     = "media.oneearlybird.ai"
}

resource "aws_route53_zone" "media" {
  count = var.create_media_zone ? 1 : 0
  name  = var.media_subdomain
}

output "media_zone_ns" {
  value       = var.create_media_zone ? aws_route53_zone.media[0].name_servers : []
  description = "Delegate this NS set at your parent zone to activate the media subdomain"
}

# Create ALIAS A record at the subdomain apex to the ALB (valid once delegated)
resource "aws_route53_record" "media_zone_alias_to_alb" {
  count  = var.create_media_zone ? 1 : 0
  zone_id = aws_route53_zone.media[0].zone_id
  name    = aws_route53_zone.media[0].name
  type    = "A"
  alias {
    name                   = aws_lb.media_alb.dns_name
    zone_id                = aws_lb.media_alb.zone_id
    evaluate_target_health = true
  }
}
