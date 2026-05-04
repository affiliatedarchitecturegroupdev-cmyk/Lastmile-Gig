variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "node_type" { type = string }
variable "num_nodes" { type = number }

variable "port" {
  type    = number
  default = 6379
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "lastmile-${var.environment}-cache-subnet"
  subnet_ids = var.subnet_ids
  
  tags = {
    Name = "lastmile-${var.environment}-cache-subnet"
  }
}

resource "aws_security_group" "cache" {
  name        = "lastmile-${var.environment}-cache-sg"
  description = "Security group for ElastiCache ${var.environment}"
  vpc_id      = var.vpc_id
  
  ingress {
    from_port   = var.port
    to_port     = var.port
    protocol   = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "Redis"
  }
  
  tags = {
    Name = "lastmile-${var.environment}-cache-sg"
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "lastmile-${var.environment}-redis"
  replication_group_description = "Lastmile Gig Redis ${var.environment}"
  
  node_type                = var.node_type
  num_node_groups         = 1
  members_node_groups     = [for i in range(var.num_nodes) : {
    node_group_id = "primary-${i}"
    slots       = "0-5461"
  }]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token_enabled      = true
  
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.cache.id]
  
  automatic_failover_enabled = true
  multi_az_enabled = true
  
  backup_enabled = true
  snapshot_retention_limit = 7
  
  engine               = "redis"
  engine_version      = "7.0"
  port              = var.port
  
  tags = {
    Name = "lastmile-${var.environment}-redis"
    Environment = var.environment
  }
}

output "redis_endpoint" {
  value = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "redis_port" {
  value = aws_elasticache_replication_group.main.port
}