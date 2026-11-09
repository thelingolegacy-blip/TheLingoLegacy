import 'package:flutter_test/flutter_test.dart';
import 'package:lingo_legacy/main.dart';

void main() {
  testWidgets('mobile preview shell renders without Firebase credentials', (tester) async {
    await tester.pumpWidget(const LingoLegacyApp());

    expect(find.text('THE LINGO LEGACY'), findsOneWidget);
    expect(find.text('The Lingo\nUniverse Hub'), findsOneWidget);
    expect(find.text('CHOOSE YOUR DESTINATION'), findsOneWidget);
    expect(find.text('Account'), findsOneWidget);
  });
}
