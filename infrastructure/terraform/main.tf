terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default    = "af-south-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default    = "production"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default    = "lastmile-gig"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default    = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default    = ["af-south-1a", "af-south-1b", "af-south-1c"]
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  cluster_name = var.cluster_name
  vpc_cidr = var.vpc_cidr
  availability_zones = var.availability_zones
}

# EKS Module
module "eks" {
  source = "./modules/eks"
  
  environment     = var.environment
  cluster_name   = var.cluster_name
  vpc_id         = module.vpc.vpc_id
  subnet_ids    = module.vpc.private_subnet_ids
  node_groups   = {
    core = {
      instance_types = ["m6i.xlarge"]
      min_size    = 3
      max_size   = 20
      desired   = 5
    }
    memory = {
      instance_types = ["r6i.2xlarge"]
      min_size    = 2
      max_size   = 10
      desired   = 3
    }
  }
}

# RDS Module
module "rds" {
  source = "./modules/rds"
  
  environment     = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids    = module.vpc.private_subnet_ids
  db_name       = "lastmile"
  instance_class = "db.r6g.xlarge"
  allocated_storage = 100
}

# ElastiCache Module
module "elasticache" {
  source = "./modules/elasticache"
  
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  node_type   = "cache.r6g.xlarge"
  num_nodes  = 3
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "cluster_name" {
  value = module.eks.cluster_name
}

output "vpc_id" {
  value = module.vpc.vpc_id
}