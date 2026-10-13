variable "aws_region" { type = string }
variable "vpc_id" { type = string }
variable "subnet_id" { type = string }

variable "ami_id" {
  type        = string
  description = "Approved Ubuntu LTS x86_64 AMI ID for the selected region."
}

variable "instance_type" {
  type    = string
  default = "t3.large"
}

variable "root_volume_size_gib" {
  type    = number
  default = 40

  validation {
    condition     = var.root_volume_size_gib >= 30 && var.root_volume_size_gib <= 500
    error_message = "Root volume size must be 30–500 GiB."
  }
}

variable "allowed_egress_cidrs" {
  type        = list(string)
  description = "Required explicit destination CIDRs for the approved egress design. Do not use a global IPv4 allow-all rule."

  validation {
    condition = length(var.allowed_egress_cidrs) > 0 && alltrue([
      for cidr in var.allowed_egress_cidrs :
      can(cidrhost(cidr, 0)) &&
      can(tonumber(split("/", cidr)[1])) &&
      tonumber(split("/", cidr)[1]) >= 8
    ])
    error_message = "Provide valid, explicitly approved IPv4 destination CIDRs with prefixes /8 or narrower in scope (prefix length >= 8). Broad catch-all ranges are prohibited; prefer an approved outbound proxy or egress firewall."
  }
}

variable "environment" {
  type    = string
  default = "recovery"
}
