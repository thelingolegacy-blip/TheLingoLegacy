import 'package:flutter_test/flutter_test.dart';
import 'package:lingo_legacy/main.dart';

void main() {
  testWidgets('the hub remains usable when Firebase is not configured',
      (tester) async {
    await tester.pumpWidget(const LingoLegacyApp(firebaseReady: false));

    expect(find.text('THE LINGO LEGACY'), findsOneWidget);
    expect(
      find.text(
        'Preview mode: Firebase services are not configured. Account, sync, and cloud features remain unavailable.',
      ),
      findsOneWidget,
    );
    expect(find.text('CHOOSE YOUR DESTINATION'), findsOneWidget);
  });

  testWidgets('the Firebase warning is absent after successful initialization',
      (tester) async {
    await tester.pumpWidget(const LingoLegacyApp(firebaseReady: true));

    expect(find.text('THE LINGO LEGACY'), findsOneWidget);
    expect(
      find.text(
        'Preview mode: Firebase services are not configured. Account, sync, and cloud features remain unavailable.',
      ),
      findsNothing,
    );
  });
}
