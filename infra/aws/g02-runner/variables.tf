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
  description = "Review and restrict before production; use an approved egress path."
  default     = ["0.0.0.0/0"]
}
variable "environment" {
  type    = string
  default = "recovery"
}
