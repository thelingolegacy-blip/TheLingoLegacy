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
  description = "SSH administration only through Google Cloud IAP TCP forwarding."
}

resource "google_compute_instance" "runner" {
  name         = var.instance_name
  machine_type = var.machine_type
  zone         = var.zone
  tags         = ["${var.name_prefix}-vm"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2404-lts-amd64"
      size  = var.boot_disk_gb
      type  = "pd-balanced"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.runner.id
    # External IPv4 is used for outbound GitHub HTTPS. No ingress firewall is
    # opened to the public internet; SSH is restricted to IAP above.
    access_config {}
  }

  metadata = {
    enable-oslogin          = "TRUE"
    block-project-ssh-keys  = "TRUE"
    serial-port-enable      = "FALSE"
  }

  metadata_startup_script = file("${path.module}/startup.sh")

  service_account {
    # No project IAM roles are granted to this VM identity by this module.
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  shielded_instance_config {
    enable_secure_boot          = true
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }

  labels = {
    managed_by = "terraform"
    purpose    = "github-actions-runner"
    environment = "recovery"
  }

  allow_stopping_for_update = true
}
