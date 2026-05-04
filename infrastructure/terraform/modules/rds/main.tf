variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "db_name" { type = string }
variable "instance_class" { type = string }
variable "allocated_storage" { type = number }

variable "db_username" {
  type    = string
  default = "lastmile"
}

variable "db_port" {
  type    = number
  default = 5432
}

resource "aws_db_subnet_group" "main" {
  name       = "lastmile-${var.environment}-db-subnet"
  subnet_ids = var.subnet_ids
  
  tags = {
    Name = "lastmile-${var.environment}-db-subnet"
  }
}

resource "aws_security_group" "db" {
  name        = "lastmile-${var.environment}-db-sg"
  description = "Security group for RDS ${var.environment}"
  vpc_id      = var.vpc_id
  
  ingress {
    from_port   = var.db_port
    to_port     = var.db_port
    protocol   = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "PostgreSQL"
  }
  
  tags = {
    Name = "lastmile-${var.environment}-db-sg"
  }
}

resource "aws_db_instance" "main" {
  identifier     = "lastmile-${var.environment}-db"
  engine        = "postgres"
  engine_version = "15.4"
  
  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage
  storage_encrypted = true
  
  db_name  = var.db_name
  username = var.db_username
  port     = var.db_port
  
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  
  backup_retention_period = 7
  backup_window = "03:00-04:00"
  maintenance_window = "mon:04:00-mon:05:00"
  
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "lastmile-${var.environment}-final"
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  
  tags = {
    Name = "lastmile-${var.environment}-db"
    Environment = var.environment
  }
}

output "db_instance_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "db_instance_address" {
  value = aws_db_instance.main.address
}

output "db_instance_port" {
  value = aws_db_instance.main.port
}