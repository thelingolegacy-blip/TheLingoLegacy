variable "project_id" {
  description = "Existing Google Cloud project ID with billing enabled."
  type        = string
  validation {
    condition     = length(trimspace(var.project_id)) > 0
    error_message = "project_id must be set to an existing Google Cloud project."
  }
}

variable "region" {
  description = "Google Cloud region for the runner subnet."
  type        = string
  default     = "us-east1"
}

variable "zone" {
  description = "Compute Engine zone in the selected region."
  type        = string
  default     = "us-east1-b"
  validation {
    condition     = startswith(var.zone, "${var.region}-")
    error_message = "zone must belong to the selected region (for example, region us-east1 and zone us-east1-b)."
  }
}

variable "instance_name" {
  description = "Compute Engine VM name."
  type        = string
  default     = "lingo-legacy-g02"
}

variable "name_prefix" {
  description = "Prefix used for network resources."
  type        = string
  default     = "lingo-g02"
}

variable "machine_type" {
  description = "Compute Engine machine type."
  type        = string
  default     = "e2-standard-2"
}

variable "boot_disk_gb" {
  description = "Balanced persistent boot disk size in GB."
  type        = number
  default     = 40
  validation {
    condition     = var.boot_disk_gb >= 30 && var.boot_disk_gb <= 200
    error_message = "boot_disk_gb must be between 30 and 200 GB."
  }
}

variable "subnet_cidr" {
  description = "Private subnet CIDR; choose a range that does not overlap existing VPCs."
  type        = string
  default     = "10.72.0.0/24"
}
