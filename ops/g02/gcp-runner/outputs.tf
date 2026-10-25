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

output "iap_ssh_command" {
  value       = "gcloud compute ssh ${google_compute_instance.runner.name} --zone=${google_compute_instance.runner.zone} --project=${var.project_id} --tunnel-through-iap"
  description = "Suggested SSH command using IAP."
}

output "network_name" {
  value       = google_compute_network.runner.name
  description = "Dedicated VPC network for the G02 runner."
}

output "subnetwork_name" {
  value       = google_compute_subnetwork.runner.name
  description = "Dedicated subnet for the G02 runner."
}

output "cloud_nat_name" {
  value       = google_compute_router_nat.runner.name
  description = "Cloud NAT used for outbound connectivity without a public VM IP."
}
