variable "environment" { type = string }
variable "cluster_name" { type = string }
variable "vpc_cidr" { type = string }
variable "availability_zones" { type = list(string) }

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
}

variable "database_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.20.0/24", "10.0.21.0/24", "10.0.22.0/24"]
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support = true
  tags = {
    Name        = "${var.cluster_name}-${var.environment}-vpc"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "${var.cluster_name}-${var.environment}-igw"
  }
}

resource "aws_subnet" "public" {
  count = 3
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  tags = {
    Name = "${var.cluster_name}-${var.environment}-public-${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count = 3
  vpc_id            = aws_vpc.main.id
  cidr_block       = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  tags = {
    Name = "${var.cluster_name}-${var.environment}-private-${count.index + 1}"
  }
}

resource "aws_subnet" "database" {
  count = 3
  vpc_id            = aws_vpc.main.id
  cidr_block       = var.database_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  tags = {
    Name = "${var.cluster_name}-${var.environment}-db-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "main" {
  count = 3
  allocation_id = aws_eip.nat[count.index].id
  subnet_id   = aws_subnet.public[count.index].id
  tags = {
    Name = "${var.cluster_name}-${var.environment}-nat-${count.index + 1}"
  }
  depends_on = [aws_internet_gateway.main]
}

resource "aws_eip" "nat" {
  count = 3
  domain = "vpc"
  tags = {
    Name = "${var.cluster_name}-${var.environment}-eip-${count.index + 1}"
  }
}

resource "aws_route_table" "private" {
  count = 3
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
  tags = {
    Name = "${var.cluster_name}-${var.environment}-private-rt-${count.index + 1}"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = {
    Name = "${var.cluster_name}-${var.environment}-public-rt"
  }
}

resource "aws_route_table_association" "private" {
  count = 3
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

resource "aws_route_table_association" "public" {
  count = 3
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.cluster_name}-${var.environment}-db-subnet"
  subnet_ids = aws_subnet.database[*].id
  tags = {
    Name = "${var.cluster_name}-${var.environment}-db-subnet-group"
  }
}

output "vpc_id" { value = aws_vpc.main.id }
output "vpc_cidr" { value = aws_vpc.main.cidr_block }
output "public_subnet_ids" { value = aws_subnet.public[*].id }
output "private_subnet_ids" { value = aws_subnet.private[*].id }
output "database_subnet_ids" { value = aws_subnet.database[*].id }