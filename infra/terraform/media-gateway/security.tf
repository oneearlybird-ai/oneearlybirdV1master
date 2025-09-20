resource "aws_security_group" "alb_sg" {
  name        = "media-alb-sg"
  description = "ALB ingress for media WebSocket"
  vpc_id      = data.aws_vpc.default.id

  # Open 443 broadly (token-protected WS); can be restricted later
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_security_group" "instance_sg" {
  name        = "media-instance-sg"
  description = "Instance accepts traffic from ALB only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = var.ws_port
    to_port         = var.ws_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

