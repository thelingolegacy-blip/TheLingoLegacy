import 'package:flutter_test/flutter_test.dart';
import 'package:lingo_legacy/main.dart';

void main() {
  testWidgets('the hub remains usable when Firebase is not configured',
      (tester) async {
    await tester.pumpWidget(const LingoLegacyApp(firebaseReady: false));

    expect(find.text('THE LINGO LEGACY'), findsOneWidget);
    expect(
      find.text(
        'PREVIEW MODE — Firebase configuration is not supplied. Accounts and cloud sync are unavailable.',
      ),
      findsOneWidget,
    );
    expect(find.text('CHOOSE YOUR DESTINATION'), findsOneWidget);
  });

  testWidgets('Firebase initialization does not show preview warning',
      (tester) async {
    await tester.pumpWidget(const LingoLegacyApp(firebaseReady: true));

    expect(find.text('THE LINGO LEGACY'), findsOneWidget);
    expect(
      find.text(
        'Firebase client initialized. Authentication, data rules, and backend readiness remain separately gated.',
      ),
      findsOneWidget,
    );
  });
}
