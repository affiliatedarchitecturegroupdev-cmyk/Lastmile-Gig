# Staging Environment
locals {
  environment = "staging"
}

inputs = {
  environment = "staging"
  env_name   = "staging"
  
  tags = {
    Project     = "lastmilegig"
    Environment = "staging"
    CostCenter = "engineering"
  }
}

dependencies {
  paths = ["../global"]
}