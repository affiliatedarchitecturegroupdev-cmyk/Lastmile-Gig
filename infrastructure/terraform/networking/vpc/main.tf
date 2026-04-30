# AWS VPC Networking
# P005 - Multi-AZ VPC for LASTMILE GIG

# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = merge(var.tags, {
    Name = "${var.project_name}-vpc-${var.environment}"
  })
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.tags, {
    Name = "${var.project_name}-igw"
  })
}

# Public Subnets (3 AZs - Johannesburg region)
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block             = var.public_subnet_1
  availability_zone     = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.project_name}-public-sn-1"
  })
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block             = var.public_subnet_2
  availability_zone     = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.project_name}-public-sn-2"
  })
}

resource "aws_subnet" "public_3" {
  vpc_id                  = aws_vpc.main.id
  cidr_block             = var.public_subnet_3
  availability_zone     = "${var.aws_region}c"
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.project_name}-public-sn-3"
  })
}

# Private Subnets (Application)
resource "aws_subnet" "private_1" {
  vpc_id          = aws_vpc.main.id
  cidr_block     = var.private_subnet_1
  availability_zone = "${var.aws_region}a"

  tags = merge(var.tags, {
    Name = "${var.project_name}-private-sn-1"
  })
}

resource "aws_subnet" "private_2" {
  vpc_id          = aws_vpc.main.id
  cidr_block     = var.private_subnet_2
  availability_zone = "${var.aws_region}b"

  tags = merge(var.tags, {
    Name = "${var.project_name}-private-sn-2"
  })
}

resource "aws_subnet" "private_3" {
  vpc_id          = aws_vpc.main.id
  cidr_block     = var.private_subnet_3
  availability_zone = "${var.aws_region}c"

  tags = merge(var.tags, {
    Name = "${var.project_name}-private-sn-3"
  })
}

# Database Subnets (RDS)
resource "aws_subnet" "database_1" {
  vpc_id          = aws_vpc.main.id
  cidr_block     = var.database_subnet_1
  availability_zone = "${var.aws_region}a"

  tags = merge(var.tags, {
    Name = "${var.project_name}-database-sn-1"
  })
}

resource "aws_subnet" "database_2" {
  vpc_id          = aws_vpc.main.id
  cidr_block     = var.database_subnet_2
  availability_zone = "${var.aws_region}b"

  tags = merge(var.tags, {
    Name = "${var.project_name}-database-sn-2"
  })
}

resource "aws_subnet" "database_3" {
  vpc_id          = aws_vpc.main.id
  cidr_block     = var.database_subnet_3
  availability_zone = "${var.aws_region}c"

  tags = merge(var.tags, {
    Name = "${var.project_name}-database-sn-3"
  })
}

# NAT Gateway (for private subnets outbound)
resource "aws_eip" "nat_1" {
  domain = "vpc"

  tags = merge(var.tags, {
    Name = "${var.project_name}-nat-eip-1"
  })
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat_1.id
  subnet_id    = aws_subnet.public_1.id

  tags = merge(var.tags, {
    Name = "${var.project_name}-nat-gw"
  })

  depends_on = [aws_internet_gateway.main]
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-public-rt"
  })
}

resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_3" {
  subnet_id      = aws_subnet.public_3.id
  route_table_id = aws_route_table.public.id
}

# Private Route Table (via NAT)
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-private-rt"
  })
}

resource "aws_route_table_association" "private_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_3" {
  subnet_id      = aws_subnet.private_3.id
  route_table_id = aws_route_table.private.id
}

# Database Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-dbsg-${var.environment}"
  subnet_ids = [aws_subnet.database_1.id, aws_subnet.database_2.id, aws_subnet.database_3.id]

  tags = merge(var.tags, {
    Name = "${var.project_name}-dbsg"
  })
}

# Security Groups
resource "aws_security_group" "ALB" {
  name        = "${var.project_name}-sg-alb-${var.environment}"
  description = "Security group for Application Load Balancers"
  vpc_id     = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port   = 443
    protocol   = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port   = 80
    protocol   = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port   = 0
    protocol   = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_security_group" "app" {
  name        = "${var.project_name}-sg-app-${var.environment}"
  description = "Security group for application services"
  vpc_id     = aws_vpc.main.id

  ingress {
    from_port       = 443
    to_port         = 443
    protocol       = "tcp"
    security_groups = [aws_security_group.ALB.id]
  }

  ingress {
    from_port       = 80
    to_port         = 80
    protocol       = "tcp"
    security_groups = [aws_security_group.ALB.id]
  }

  egress {
    from_port   = 0
    to_port   = 0
    protocol   = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_security_group" "database" {
  name        = "${var.project_name}-sg-db-${var.environment}"
  description = "Security group for databases"
  vpc_id     = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol       = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol       = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port   = 0
    protocol   = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

# Outputs
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = [aws_subnet.public_1.id, aws_subnet.public_2.id, aws_subnet.public_3.id]
}

output "private_subnet_ids" {
  value = [aws_subnet.private_1.id, aws_subnet.private_2.id, aws_subnet.private_3.id]
}

output "database_subnet_ids" {
  value = [aws_subnet.database_1.id, aws_subnet.database_2.id, aws_subnet.database_3.id]
}

output "database_subnet_group" {
  value = aws_db_subnet_group.main.name
}