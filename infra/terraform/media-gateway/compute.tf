locals {
  # choose two subnets for ASG from allowed AZs (exclude unsupported AZs)
  asg_subnets = slice(data.aws_subnets.allowed.ids, 0, 2)
  user_data = templatefile("${path.module}/user_data.tpl", {
    server_mjs         = file("${path.module}/templates/server.mjs")
    PORT               = var.ws_port
    WS_PATH            = var.ws_path
    MEDIA_AUTH_TOKEN   = var.media_auth_token
    ELEVENLABS_API_KEY = var.elevenlabs_api_key
    AWS_REGION         = var.aws_region
  })
}

resource "aws_launch_template" "media_lt" {
  name_prefix   = "media-ws-lt-"
  image_id      = data.aws_ami.debian12_arm64.id
  instance_type = var.instance_type
  iam_instance_profile { name = aws_iam_instance_profile.ec2_media_profile.name }
  vpc_security_group_ids = [aws_security_group.instance_sg.id]
  update_default_version  = true

  user_data = base64encode(local.user_data)

  tag_specifications {
    resource_type = "instance"
    tags          = merge(var.tags, { Name = "media-ws" })
  }
  tag_specifications {
    resource_type = "volume"
    tags          = var.tags
  }
  tags = var.tags
}

resource "aws_autoscaling_group" "media_asg" {
  name                = "media-ws-asg"
  min_size            = var.min_size
  max_size            = var.max_size
  desired_capacity    = var.desired_capacity
  vpc_zone_identifier = local.asg_subnets

  launch_template {
    id      = aws_launch_template.media_lt.id
    version = "$Latest"
  }

  target_group_arns = [aws_lb_target_group.media_tg.arn]
  health_check_type = "ELB"
  tag {
    key                 = "Name"
    value               = "media-ws"
    propagate_at_launch = true
  }
  lifecycle {
    create_before_destroy = true
  }
}
