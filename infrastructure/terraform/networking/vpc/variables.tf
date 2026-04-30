# VPC Variables

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "lastmilegig"
}

variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "af-south-1"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

# Network CIDRs
variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_1" {
  description = "Public subnet 1 CIDR"
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_2" {
  description = "Public subnet 2 CIDR"
  type        = string
  default     = "10.0.2.0/24"
}

variable "public_subnet_3" {
  description = "Public subnet 3 CIDR"
  type        = string
  default     = "10.0.3.0/24"
}

variable "private_subnet_1" {
  description = "Private subnet 1 CIDR"
  type        = string
  default     = "10.0.10.0/24"
}

variable "private_subnet_2" {
  description = "Private subnet 2 CIDR"
  type        = string
  default     = "10.0.11.0/24"
}

variable "private_subnet_3" {
  description = "Private subnet 3 CIDR"
  type        = string
  default     = "10.0.12.0/24"
}

variable "database_subnet_1" {
  description = "Database subnet 1 CIDR"
  type        = string
  default     = "10.0.20.0/24"
}

variable "database_subnet_2" {
  description = "Database subnet 2 CIDR"
  type        = string
  default     = "10.0.21.0/24"
}

variable "database_subnet_3" {
  description = "Database subnet 3 CIDR"
  type        = string
  default     = "10.0.22.0/24"
}