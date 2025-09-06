resource "aws_kms_key" "audit" {
  description = "${var.project}-audit"
  enable_key_rotation = true
}
