data "archive_file" "audit_zip" {
  type        = "zip"
  source_dir  = "${path.module}/functions/audit-collector"
  output_path = "${path.module}/functions/audit-collector.zip"
}
resource "aws_lambda_function" "audit" {
  function_name = "${var.project}-audit-collector"
  role          = aws_iam_role.audit_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  filename      = data.archive_file.audit_zip.output_path
  timeout       = 10
  tracing_config {
    mode = "Active"
  }
  environment {
    variables = {
      AUDIT_LOG_SECRET = var.audit_log_secret
      AUDIT_BUCKET     = aws_s3_bucket.audit.bucket
      AUDIT_PREFIX     = "audit/"
      AUDIT_KMS_KEY_ID = aws_kms_key.audit.id
    }
  }
}
