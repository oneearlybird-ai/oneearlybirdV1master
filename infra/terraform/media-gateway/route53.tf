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
