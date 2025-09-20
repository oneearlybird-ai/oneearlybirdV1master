resource "aws_iam_role" "ec2_media_role" {
  name               = "media-gateway-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = { Service = "ec2.amazonaws.com" },
      Action   = "sts:AssumeRole"
    }]
  })
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_media_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_media_profile" {
  name = "media-gateway-ec2-profile"
  role = aws_iam_role.ec2_media_role.name
}

resource "aws_iam_policy" "media_ssm_read" {
  name        = "media-gateway-ssm-read"
  description = "Allow instances to read SecureString MEDIA_AUTH_TOKEN from SSM and decrypt via KMS"
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = ["ssm:GetParameter"],
        Resource = [
          aws_ssm_parameter.media_auth_token.arn,
          "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/earlybird/eleven/*",
          "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/oneearlybird/eleven/*"
        ]
      },
      {
        Effect   = "Allow",
        Action   = ["kms:Decrypt"],
        Resource = data.aws_kms_alias.ssm.target_key_arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "media_ssm_read_attach" {
  role       = aws_iam_role.ec2_media_role.name
  policy_arn = aws_iam_policy.media_ssm_read.arn
}
