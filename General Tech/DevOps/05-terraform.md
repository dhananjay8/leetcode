# Terraform & Infrastructure as Code (IaC)

## What is Terraform?
Declarative IaC tool by HashiCorp. You define **desired state** in `.tf` files; Terraform figures out how to achieve it.

## Core Workflow
```bash
terraform init      # download providers, initialize backend
terraform plan      # preview changes (dry run)
terraform apply     # apply changes to infrastructure
terraform destroy   # tear down all resources
```

## Key Concepts

### HCL Syntax
```hcl
# Provider configuration
provider "aws" {
  region = "us-east-1"
}

# Resource definition
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type

  tags = {
    Name        = "web-server"
    Environment = var.environment
  }
}

# Variables
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "environment" {
  type = string
}

# Outputs
output "public_ip" {
  value = aws_instance.web.public_ip
}
```

### State Management
```
Terraform State (terraform.tfstate):
- Maps real infra to your config
- Tracks resource IDs, attributes, dependencies
- MUST be stored securely (never commit to git)
```

**Remote Backend (Required for teams):**
```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock"  # state locking
    encrypt        = true
  }
}
```

### Modules (Reusable Components)
```hcl
# modules/vpc/main.tf — reusable VPC module
resource "aws_vpc" "main" {
  cidr_block = var.cidr
  tags       = { Name = var.name }
}

# Root module uses it:
module "vpc" {
  source = "./modules/vpc"
  cidr   = "10.0.0.0/16"
  name   = "production-vpc"
}
```

### Data Sources (Read Existing Resources)
```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-*"]
  }
}

resource "aws_instance" "web" {
  ami = data.aws_ami.ubuntu.id
}
```

## Terraform Commands Cheat Sheet
```bash
terraform fmt               # format .tf files
terraform validate          # check syntax
terraform plan -out=plan.out  # save plan
terraform apply plan.out    # apply saved plan
terraform state list        # list tracked resources
terraform state show aws_instance.web  # inspect resource
terraform import aws_instance.web i-1234  # import existing resource
terraform taint aws_instance.web  # mark for recreation
terraform workspace list    # list workspaces
terraform workspace new staging  # create workspace
```

## Best Practices

1. **Remote state** with locking (S3 + DynamoDB)
2. **Never edit state manually** — use `terraform import`, `terraform state mv`
3. **Use modules** for reusable infrastructure
4. **Variables + tfvars** per environment (`prod.tfvars`, `staging.tfvars`)
5. **Pin provider versions**: `required_providers { aws = { version = "~> 5.0" } }`
6. **Plan before apply** — always review changes
7. **Use workspaces** or separate state files per environment
8. **`terraform plan` in CI** — show changes on PR, apply on merge

## Interview Questions

**Q: What is Terraform state and why is it important?**
State maps your config to real resources. Without it, Terraform can't know what exists. It stores resource IDs, dependencies, and metadata. Must be stored remotely with locking for team use.

**Q: What happens if two people run `terraform apply` simultaneously?**
Without state locking, they can corrupt the state (race condition). Solution: use DynamoDB lock table with S3 backend — only one operation at a time.

**Q: How do you handle secrets in Terraform?**
- Use `sensitive = true` on variables (hides from plan output)
- Store secrets in AWS Secrets Manager / Vault, reference via data source
- Never hardcode in `.tf` files
- Use environment variables: `TF_VAR_db_password`

**Q: Terraform vs CloudFormation vs Pulumi?**
- **Terraform**: Multi-cloud, HCL, largest ecosystem
- **CloudFormation**: AWS-only, YAML/JSON, tightly integrated
- **Pulumi**: Real programming languages (Python, TS), multi-cloud

**Q: What is `terraform taint`?**
Marks a resource for destruction and recreation on next apply. Useful when a resource is in a bad state. Replaced by `-replace` flag: `terraform apply -replace="aws_instance.web"`
