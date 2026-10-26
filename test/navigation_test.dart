import 'package:flutter_test/flutter_test.dart';
import 'package:lingo_legacy/main.dart';

void main() {
  testWidgets('unconfigured Firebase does not prevent the navigation shell from rendering', (tester) async {
    await tester.pumpWidget(const LingoLegacyApp());
    expect(find.text('THE LINGO LEGACY'), findsOneWidget);
    expect(find.text('CHOOSE YOUR DESTINATION'), findsOneWidget);
    expect(find.text('Firebase configuration'), findsNothing);
  });

  testWidgets('selecting a destination opens its detail screen', (tester) async {
    await tester.pumpWidget(const LingoLegacyApp());
    await tester.tap(find.text('Games & Play'));
    await tester.pumpAndSettle();
    expect(find.text('PLATFORM CONNECTION'), findsOneWidget);
    expect(find.text('Check platform API'), findsOneWidget);
    expect(find.text('Website route: /games/'), findsOneWidget);
  });
}
