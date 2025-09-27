variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "domain_name" {
  # media gateway hostname
  type    = string
  default = "media.oneearlybird.ai"
}

variable "instance_type" {
  type    = string
  default = "c7g.2xlarge"
}
variable "desired_capacity" {
  type    = number
  default = 2
}
variable "min_size" {
  type    = number
  default = 2
}
variable "max_size" {
  type    = number
  default = 6
}

variable "ws_port" {
  type    = number
  default = 8080
}
variable "ws_path" {
  type    = string
  default = "/rtm/voice"
}

variable "media_auth_token" {
  # optional JWT/token; leave empty to disable
  type      = string
  default   = ""
  sensitive = true
}

variable "elevenlabs_api_key" {
  # optional; set later via SSM/Env
  type      = string
  default   = ""
  sensitive = true
}

variable "tags" {
  type = map(string)
  default = {
    Project = "oneearlybird"
    Stack   = "media-gateway"
  }
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID for the apex domain (e.g., oneearlybird.ai)"
  type        = string
  default     = "Z0535333M2WVAJ6EXV03"
}

variable "allowed_azs" {
  description = "Allowed Availability Zones for instances (exclude unsupported ones for chosen instance type)"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d", "us-east-1f"]
}

# Artifact settings for media gateway server file
variable "artifact_bucket" {
  description = "S3 bucket name that holds server.mjs artifact"
  type        = string
  default     = "oneearlybird-media-artifacts-102732512054-us-east-1"
}

variable "artifact_key" {
  description = "S3 object key for server.mjs artifact"
  type        = string
  default     = "media/server-cf39ad6cdcf9a7c4070c6a70af591a7d451bb445339ae0abed35e9a18917c97c.mjs"
}

variable "artifact_sha256" {
  description = "SHA256 (hex) of the server.mjs artifact for verification"
  type        = string
  default     = "cf39ad6cdcf9a7c4070c6a70af591a7d451bb445339ae0abed35e9a18917c97c"
}

variable "vendor_sr_hz" {
  description = "Preferred vendor PCM sample rate (8000 or 16000)."
  type        = number
  default     = 16000
}

variable "ssh_key_name" {
  description = "EC2 key pair name to attach to instances for SSH access"
  type        = string
  default     = "oneearlybird"
}
