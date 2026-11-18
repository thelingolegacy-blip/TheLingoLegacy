import 'package:flutter_test/flutter_test.dart';
import 'package:doughboys_oasis/main.dart';

void main() {
  test('Oasis demo catalog has unique IDs and positive virtual prices', () {
    expect(catalog, isNotEmpty);
    final ids = catalog.map((item) => item.id).toSet();
    expect(ids.length, catalog.length);
    expect(catalog.every((item) => item.price > 0), isTrue);
    expect(catalog.every((item) => item.name.isNotEmpty && item.category.isNotEmpty), isTrue);
  });
}
