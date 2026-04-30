# Production Environment
locals {
  environment = "prod"
}

inputs = {
  environment = "prod"
  env_name   = "production"
  
  tags = {
    Project     = "lastmilegig"
    Environment = "production"
    CostCenter = "business"
  }
}

dependencies {
  paths = ["../global"]
}