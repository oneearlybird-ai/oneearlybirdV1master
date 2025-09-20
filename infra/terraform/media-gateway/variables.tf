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
