# Terraform Remote State Backend

terraform {
  backend "s3" {
    bucket         = "lastmilegig-terraform-state"
    key            = "global/s3/terraform.tfstate"
    region         = "af-south-1"
    encrypt        = true
    dynamodb_table = "lastmilegig-terraform-locks"
  }
}

# Provider
provider "aws" {
  region = "af-south-1"
  
  default_tags {
    tags = {
      Project     = "lastmilegig"
      Environment = "production"
      ManagedBy   = "terraform"
    }
  }
}

# S3 Bucket for Terraform State
resource "aws_s3_bucket" "terraform_state" {
  bucket = "lastmilegig-terraform-state"

  tags = {
    Name        = "LASTMILE GIG Terraform State"
    Project     = "lastmilegig"
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# DynamoDB Table for State Locking
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "lastmilegig-terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key    = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  ttl {
    attribute_name = "ExpiresAt"
    enabled        = true
  }

  tags = {
    Name        = "LASTMILE GIG Terraform Locks"
    Project     = "lastmilegig"
  }
}

# Outputs
output "terraform_state_bucket" {
  value = aws_s3_bucket.terraform_state.id
}

output "terraform_locks_table" {
  value = aws_dynamodb_table.terraform_locks.name
}