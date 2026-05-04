variable "environment" { type = string }
variable "cluster_name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "node_groups" { type = map(any) }

variable "cluster_version" {
  type    = string
  default = "1.28"
}

variable "eks_managed_node_groups" {
  type = map(object({
    instance_types = list(string)
    min_size     = number
    max_size     = number
    desired     = number
  }))
  default = {}
}

locals {
  cluster_name = "${var.cluster_name}-${var.environment}"
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"
  
  cluster_name    = local.cluster_name
  cluster_version = var.cluster_version
  vpc_id = var.vpc_id
  subnet_ids = var.subnet_ids
  
  eks_managed_node_groups = {
    core = {
      name = "core"
      instance_types = ["m6i.xlarge"]
      min_size = 3
      max_size = 20
      desired_capacity = 5
      capacity_type = "ON_DEMAND"
      
      labels = {
        tier = "core"
      }
      
      tags = {
        Environment = var.environment
        NodeGroup = "core"
      }
    }
    
    memory = {
      name = "memory"
      instance_types = ["r6i.2xlarge"]
      min_size = 2
      max_size = 10
      desired_capacity = 3
      capacity_type = "ON_DEMAND"
      
      labels = {
        tier = "memory"
      }
      
      tags = {
        Environment = var.environment
        NodeGroup = "memory"
      }
    }
  }
  
  tags = {
    Environment = var.environment
  }
}

output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "cluster_arn" {
  value = module.eks.cluster_arn
}

output "cluster_oidc_issuer_url" {
  value = module.eks.cluster_oidc_issuer_url
}