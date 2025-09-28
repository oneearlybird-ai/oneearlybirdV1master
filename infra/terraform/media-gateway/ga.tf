resource "aws_globalaccelerator_accelerator" "media" {
  name               = "media-ws-accelerator"
  enabled            = true
  ip_address_type    = "IPV4"
  attributes {
    flow_logs_enabled = false
  }
  tags = var.tags
}

resource "aws_globalaccelerator_listener" "media" {
  accelerator_arn = aws_globalaccelerator_accelerator.media.id
  client_affinity = "NONE"
  protocol        = "TCP"
  port_range {
    from_port = 443
    to_port   = 443
  }
}

resource "aws_globalaccelerator_endpoint_group" "media" {
  listener_arn          = aws_globalaccelerator_listener.media.id
  endpoint_group_region = data.aws_region.current.name
  health_check_protocol = "TCP"
  health_check_port     = 443
  threshold_count       = 2
  traffic_dial_percentage = 100

  endpoint_configuration {
    endpoint_id = aws_lb.media_alb.arn
    weight      = 128
  }
}

output "global_accelerator_dns" { value = aws_globalaccelerator_accelerator.media.dns_name }
