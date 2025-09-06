resource "aws_s3_bucket" "audit" {
  bucket                = var.audit_bucket_name
  object_lock_enabled   = true
}

resource "aws_s3_bucket_versioning" "audit" {
  bucket = aws_s3_bucket.audit.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "audit" {
  bucket = aws_s3_bucket.audit.id
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.audit.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_object_lock_configuration" "audit" {
  bucket = aws_s3_bucket.audit.id
  rule {
    default_retention {
      mode = var.audit_object_lock_mode
      days = var.audit_object_lock_days
    }
  }
}

resource "aws_s3_bucket_public_access_block" "audit" {
  bucket                  = aws_s3_bucket.audit.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "audit" {
  bucket = aws_s3_bucket.audit.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "RequireTLS",
        Effect    = "Deny",
        Principal = "*",
        Action    = "s3:*",
        Resource  = [aws_s3_bucket.audit.arn, "${aws_s3_bucket.audit.arn}/*"],
        Condition = { Bool = { "aws:SecureTransport" = "false" } }
      }
    ]
  })
}
