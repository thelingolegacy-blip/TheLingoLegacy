output "instance_name" {
  value       = google_compute_instance.runner.name
  description = "Runner VM name."
}

output "zone" {
  value       = google_compute_instance.runner.zone
  description = "Runner VM zone."
}

output "internal_ip" {
  value       = google_compute_instance.runner.network_interface[0].network_ip
  description = "Runner VM internal IPv4 address."
}

output "external_ip" {
  value       = google_compute_instance.runner.network_interface[0].access_config[0].nat_ip
  description = "Runner VM external IPv4 address for outbound connectivity. No public ingress is opened."
}

output "iap_ssh_command" {
  value       = "gcloud compute ssh ${google_compute_instance.runner.name} --zone=${google_compute_instance.runner.zone} --project=${var.project_id} --tunnel-through-iap"
  description = "Suggested SSH command using IAP."
}
