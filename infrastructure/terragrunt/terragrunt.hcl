# Terragrunt Configuration
# All environments inherit from this root config

# Remote state configuration
remote_state {
  backend = "s3"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
  config = {
    bucket         = "lastmilegig-terraform-state"
    key            = "${terragrunt_workflow}/${path_relative_to_include()}/terraform.tfstate"
    region         = "af-south-1"
    encrypt        = true
    dynamodb_table = "lastmilegig-terraform-locks"
  }
}

# Generate provider block
generate = {
  path = "provider.tf"
  if_exists = "overwrite"
  template = <<EOF
provider "aws" {
  region = "af-south-1"
  
  default_tags {
    tags = {
      Project     = "lastmilegig"
      Environment = get_env("TG_ENV", "dev")
      ManagedBy   = "terragrunt"
    }
  }
}
EOF
}

# Inputs for infrastructure
inputs = {
  project_name    = "lastmilegig"
  aws_region    = "af-south-1"
  
  # Tags
  tags = {
    Project     = "lastmilegig"
    Environment = get_env("TG_ENV", "dev")
    ManagedBy   = "terragrunt"
  }
}

# Workflow settings
terragrunt = {
  disable_bucket_update = true
  
  before_hook = {
    init = {
      command = "init"
    }
  }
}