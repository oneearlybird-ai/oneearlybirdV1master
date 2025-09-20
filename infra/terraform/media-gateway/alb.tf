resource "aws_lb" "media_alb" {
  name               = "media-ws-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  # Use two subnets from allowed AZs (one per AZ)
  subnets            = slice(data.aws_subnets.allowed.ids, 0, 2)
  idle_timeout       = 600
  tags               = var.tags
}

resource "aws_lb_target_group" "media_tg" {
  name        = "media-ws-tg"
  port        = var.ws_port
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "instance"
  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 10
    timeout             = 5
    path                = "/health"
    matcher             = "200-399"
  }
  tags = var.tags
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.media_alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.cert.certificate_arn
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.media_tg.arn
  }
}
