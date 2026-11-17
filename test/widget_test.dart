import 'package:flutter_test/flutter_test.dart';
import 'package:lingo_legacy/main.dart';

void main() {
  testWidgets('universe hub renders the flagship navigation preview', (tester) async {
    tester.view.physicalSize = const Size(900, 1600);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const LingoLegacyApp());

    expect(find.text('THE LINGO LEGACY'), findsOneWidget);
    expect(find.text('The Lingo\nUniverse Hub'), findsOneWidget);
    expect(find.text('CHOOSE YOUR DESTINATION'), findsOneWidget);
    expect(find.text('Games & Play'), findsOneWidget);
    expect(find.text('Stories & Books'), findsOneWidget);
  });

  testWidgets('account action clearly states preview-only availability', (tester) async {
    await tester.pumpWidget(const LingoLegacyApp());

    await tester.tap(find.text('Account'));
    await tester.pump();

    expect(
      find.text('Account and signup services are not connected in this preview.'),
      findsOneWidget,
    );
  });
}
