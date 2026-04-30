# PostgreSQL Database with Aurora
# P011-P015 - Database Schemas

# Subnet Group (already created in VPC module via Terragrunt)
# resource "aws_db_subnet_group" "main" {
#   name = "lastmilegig-db-sng"
#   subnet_ids = var.database_subnet_ids
# }

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg-${var.environment}"
  description = "Security group for RDS PostgreSQL"
  vpc_id     = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol       = "tcp"
    security_groups = [var.app_security_group_id]
  }

  tags = var.tags
}

# RDS Cluster Parameter Group
resource "aws_rds_cluster_parameter_group" "main" {
  name   = "${var.project_name}-pgParams-${var.environment}"
  family = "postgres15"

  parameter {
    name  = "log_min_duration_statement"
    value = "3000"
  }

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "pgaudit.extension"
    value = "shared"
  }
}

# RDS Cluster
resource "aws_rds_cluster" "main" {
  cluster_identifier     = "${var.project_name}-${var.environment}"
  engine              = "aurora-postgresql"
  engine_version      = "15.5"
  database_name       = "lastmile"
  master_username    = var.db_username
  master_password    = var.db_password
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.main.name
  storage_encrypted   = true
  kms_key_id         = var.kms_key_id

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = var.db_subnet_group_name

  serverlessv2_scaling_configuration {
    min_capacity = 2
    max_capacity = 64
  }

  tags = var.tags
}

# RDS Cluster Instances
resource "aws_rds_cluster_instance" "primary" {
  cluster_identifier = aws_rds_cluster.main.id
  instance_class  = "db.serverless"
  engine        = aws_rds_cluster.main.engine
  engine_version = aws_rds_cluster.main.engine_version

  publicly_accessible = false

  tags = var.tags
}

resource "aws_rds_cluster_instance" "replica_1" {
  cluster_identifier = aws_rds_cluster.main.id
  instance_class  = "db.serverless"
  engine        = aws_rds_cluster.main.engine
  engine_version = aws_rds_cluster.main.engine_version

  publicly_accessible = false

  tags = var.tags
}

# Secrets Manager for Database Credentials
resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "${var.project_name}/db/credentials"
  description = "Database master credentials"
  kms_key_id = var.kms_key_id

  recovery_window_in_days = 7

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id

  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    engine   = "postgres"
    host     = aws_rds_cluster.main.endpoint
    port     = 5432
    dbname   = "lastmile"
  })
}

# Outputs
output "cluster_endpoint" {
  value = aws_rds_cluster.main.endpoint
}

output "cluster_reader_endpoint" {
  value = aws_rds_cluster.main.reader_endpoint
}

output "cluster_arn" {
  value = aws_rds_cluster.main.arn
}