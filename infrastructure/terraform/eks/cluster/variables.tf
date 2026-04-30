# EKS Variables

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

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "lastmilegig-cluster"
}

variable "node_group_name" {
  description = "EKS node group name"
  type        = string
  default     = "lastmilegig-nodes"
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.29"
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for EKS"
  type        = list(string)
}

variable "eks_security_group_id" {
  description = "Security group for EKS cluster"
  type        = string
}

variable "enable_public_endpoint" {
  description = "Enable public API endpoint"
  type        = bool
  default     = false
}

variable "instance_types" {
  description = "EC2 instance types for node group"
  type        = list(string)
  default     = ["m6i.large"]
}

variable "desired_capacity" {
  description = "Desired number of nodes"
  type        = number
  default     = 3
}

variable "min_capacity" {
  description = "Minimum number of nodes"
  type        = number
  default     = 2
}

variable "max_capacity" {
  description = "Maximum number of nodes"
  type        = number
  default     = 10
}

variable "oidc_thumbprint" {
  description = "OIDC provider thumbprint"
  type        = string
  default     = "9e99a48a4516fe6182b3fcc4c4a20b00ac9d2c01"
}