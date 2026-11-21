terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Dedicated VM identity. This module deliberately grants it no project roles.
# Add only narrowly scoped roles later if a documented runner task requires them.
resource "google_service_account" "runner" {
  account_id   = "${var.name_prefix}-vm"
  display_name = "LINGO G02 GitHub Actions runner VM"
  description  = "Least-privilege identity for the isolated G02 self-hosted runner."
}

resource "google_compute_network" "runner" {
  name                    = "${var.name_prefix}-network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "runner" {
  name                     = "${var.name_prefix}-subnet"
  ip_cidr_range            = var.subnet_cidr
  region                   = var.region
  network                  = google_compute_network.runner.id
  private_ip_google_access = true
}

resource "google_compute_address" "runner" {
  name         = "${var.name_prefix}-external-ip"
  region       = var.region
  address_type = "EXTERNAL"
  network_tier = "PREMIUM"
}

resource "google_compute_firewall" "iap_ssh" {
  name      = "${var.name_prefix}-allow-iap-ssh"
  network   = google_compute_network.runner.name
  direction = "INGRESS"
  priority  = 1000
  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["${var.name_prefix}-vm"]
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  description = "SSH administration through Google Cloud IAP TCP forwarding."
}

resource "google_compute_firewall" "admin_ssh" {
  count         = var.admin_ssh_cidr == "" ? 0 : 1
  name          = "${var.name_prefix}-allow-admin-ssh"
  network       = google_compute_network.runner.name
  direction     = "INGRESS"
  priority      = 900
  source_ranges = [var.admin_ssh_cidr]
  target_tags   = ["${var.name_prefix}-vm"]
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  description = "Optional direct SSH restricted to the operator-supplied trusted CIDR."
}

resource "google_compute_instance" "runner" {
  name         = var.instance_name
  machine_type = var.machine_type
  zone         = var.zone
  tags                      = ["${var.name_prefix}-vm"]
  can_ip_forward            = false
  deletion_protection       = false
  allow_stopping_for_update = true

  scheduling {
    automatic_restart   = true
    on_host_maintenance = "MIGRATE"
    provisioning_model  = "STANDARD"
  }

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2404-lts-amd64"
      size  = var.boot_disk_gb
      type  = "pd-balanced"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.runner.id
    access_config {
      nat_ip       = google_compute_address.runner.address
      network_tier = "PREMIUM"
    }
  }

  metadata = {
    enable-oslogin           = "TRUE"
    block-project-ssh-keys   = "TRUE"
    disable-legacy-endpoints = "TRUE"
    serial-port-enable       = "FALSE"
  }

  metadata_startup_script = file("${path.module}/startup.sh")

  service_account {
    email  = google_service_account.runner.email
    # The dedicated identity has no project IAM roles granted by this module.
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  shielded_instance_config {
    enable_secure_boot          = true
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }

  labels = {
    managed_by  = "terraform"
    purpose     = "github-actions-runner"
    environment = "recovery"
  }
}
