# Development Environment
locals {
  environment = "dev"
}

# Environment-specific inputs
inputs = {
  environment = "dev"
  env_name   = "development"
  
  # Dev-specific tags
  tags = {
    Project     = "lastmilegig"
    Environment = "development"
    CostCenter = "engineering"
  }
}

# Dependency configs
dependencies {
  paths = ["../global"]
}