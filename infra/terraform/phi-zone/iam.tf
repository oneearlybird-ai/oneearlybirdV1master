resource "aws_iam_role" "audit_lambda" {
  name = "${var.project}-audit-lambda"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}
resource "aws_iam_role_policy" "audit_lambda" {
  name = "${var.project}-audit-lambda"
  role = aws_iam_role.audit_lambda.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      { Effect = "Allow", Action = ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"], Resource = "*" },
      { Effect = "Allow", Action = ["s3:PutObject","s3:AbortMultipartUpload"], Resource = "${aws_s3_bucket.audit.arn}/*" },
      { Effect = "Allow", Action = ["kms:Encrypt","kms:GenerateDataKey"], Resource = aws_kms_key.audit.arn }
    ]
  })
}
