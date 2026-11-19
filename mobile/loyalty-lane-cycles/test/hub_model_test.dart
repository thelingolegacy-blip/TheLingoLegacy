import 'package:flutter_test/flutter_test.dart';
import 'package:loyalty_lane_cycles/models/hub.dart';

Map<String, dynamic> hub(String city, int index) => {
      'id': '${city.toLowerCase()}-${index.toString().padLeft(2, '0')}',
      'name': 'Candidate $index',
      'address': '$index Main St, $city, NJ, USA',
      'status': 'candidate-unverified',
      'targetHours': '24/7',
      'listedHours': 'Daily 6 AM–9 PM',
    };

void main() {
  test('parses all nine candidate hubs across the three target cities', () {
    final directory = HubDirectory.fromJson({
      'ok': true,
      'region': 'Cumberland County, NJ, USA',
      'targetHubCount': 9,
      'targetOperatingHours': '24 hours a day, 7 days a week',
      'note': 'Candidate locations only.',
      'cities': [
        {
          'city': 'Vineland',
          'hubs': List.generate(3, (index) => hub('Vineland', index + 1)),
        },
        {
          'city': 'Millville',
          'hubs': List.generate(3, (index) => hub('Millville', index + 1)),
        },
        {
          'city': 'Bridgeton',
          'hubs': List.generate(3, (index) => hub('Bridgeton', index + 1)),
        },
      ],
    });

    expect(directory.targetHubCount, 9);
    expect(directory.cities.map((city) => city.city),
        ['Vineland', 'Millville', 'Bridgeton']);
    expect(directory.cities.map((city) => city.hubs.length), [3, 3, 3]);
    expect(directory.cities.expand((city) => city.hubs).length, 9);
    expect(
      directory.cities.expand((city) => city.hubs).every(
            (candidate) =>
                candidate.status == 'candidate-unverified' &&
                candidate.targetHours == '24/7',
          ),
      isTrue,
    );
  });

  test('uses safe defaults when optional directory metadata is absent', () {
    final directory = HubDirectory.fromJson({'cities': []});
    expect(directory.region, 'Cumberland County, NJ');
    expect(directory.targetHubCount, 0);
    expect(directory.cities, isEmpty);
  });
}
