class LaundryHub {
  const LaundryHub({
    required this.id,
    required this.name,
    required this.address,
    required this.status,
    required this.targetHours,
    this.phone,
    this.listedHours,
  });

  final String id;
  final String name;
  final String address;
  final String status;
  final String targetHours;
  final String? phone;
  final String? listedHours;

  factory LaundryHub.fromJson(Map<String, dynamic> json) => LaundryHub(
        id: json['id'] as String,
        name: json['name'] as String,
        address: json['address'] as String,
        status: json['status'] as String? ?? 'candidate-unverified',
        targetHours: json['targetHours'] as String? ?? '24/7 target',
        phone: json['phone'] as String?,
        listedHours: json['listedHours'] as String?,
      );
}

class HubCity {
  const HubCity({required this.city, required this.hubs});

  final String city;
  final List<LaundryHub> hubs;

  factory HubCity.fromJson(Map<String, dynamic> json) => HubCity(
        city: json['city'] as String,
        hubs: (json['hubs'] as List<dynamic>? ?? const [])
            .map((item) => LaundryHub.fromJson(item as Map<String, dynamic>))
            .toList(growable: false),
      );
}

class HubDirectory {
  const HubDirectory({
    required this.region,
    required this.targetHubCount,
    required this.targetOperatingHours,
    required this.note,
    required this.cities,
  });

  final String region;
  final int targetHubCount;
  final String targetOperatingHours;
  final String note;
  final List<HubCity> cities;

  factory HubDirectory.fromJson(Map<String, dynamic> json) => HubDirectory(
        region: json['region'] as String? ?? 'Cumberland County, NJ',
        targetHubCount: json['targetHubCount'] as int? ?? 0,
        targetOperatingHours: json['targetOperatingHours'] as String? ?? '24/7 target',
        note: json['note'] as String? ?? 'Candidate sites only; verify before use.',
        cities: (json['cities'] as List<dynamic>? ?? const [])
            .map((item) => HubCity.fromJson(item as Map<String, dynamic>))
            .toList(growable: false),
      );
}
