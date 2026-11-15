import 'package:flutter_test/flutter_test.dart';
import 'package:loyalty_lane_cycles/models/hub.dart';

void main() {
  test('parses the three-city Cumberland County directory', () {
    final directory = HubDirectory.fromJson({
      'ok': true,
      'region': 'Cumberland County, NJ, USA',
      'targetHubCount': 9,
      'targetOperatingHours': '24 hours a day, 7 days a week',
      'note': 'Candidate locations only.',
      'cities': [
        {
          'city': 'Vineland',
          'hubs': [
            {
              'id': 'vineland-01',
              'name': 'Candidate One',
              'address': '1 Main St, Vineland, NJ, USA',
              'status': 'candidate-unverified',
              'targetHours': '24/7',
              'listedHours': 'Daily 6 AM–9 PM'
            }
          ]
        },
        {'city': 'Millville', 'hubs': []},
        {'city': 'Bridgeton', 'hubs': []}
      ]
    });

    expect(directory.targetHubCount, 9);
    expect(directory.cities.map((city) => city.city),
        ['Vineland', 'Millville', 'Bridgeton']);
    expect(directory.cities.first.hubs.single.status, 'candidate-unverified');
    expect(directory.cities.first.hubs.single.targetHours, '24/7');
  });

  test('uses safe defaults when optional directory metadata is absent', () {
    final directory = HubDirectory.fromJson({'cities': []});
    expect(directory.region, 'Cumberland County, NJ');
    expect(directory.targetHubCount, 0);
    expect(directory.cities, isEmpty);
  });
}
