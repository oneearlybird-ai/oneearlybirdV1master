variable "audit_bucket_name" { type = string }
variable "audit_object_lock_mode" { type = string  default = "COMPLIANCE" }
variable "audit_object_lock_days" { type = number  default = 90 }
variable "audit_log_secret" { type = string, sensitive = true }
