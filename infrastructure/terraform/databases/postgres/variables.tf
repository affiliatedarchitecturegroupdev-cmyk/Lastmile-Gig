# Database Variables

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "lastmilegig"
}

variable "tags" {
  description = "Tags to apply"
  type        = map(string)
  default     = {}
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "db_subnet_group_name" {
  description = "Database subnet group name"
  type        = string
}

variable "app_security_group_id" {
  description = "App security group ID"
  type        = string
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "lastmileadmin"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive = true
}

variable "kms_key_id" {
  description = "KMS key ID for encryption"
  type        = string
}