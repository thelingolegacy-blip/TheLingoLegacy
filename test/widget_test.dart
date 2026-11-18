import 'dart:ui' show Size;
import 'package:flutter_test/flutter_test.dart';
import 'package:lingo_legacy/main.dart';

void main() {
  testWidgets('universe hub renders the flagship navigation preview without overflow', (tester) async {
    tester.view.physicalSize = const Size(900, 1600);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const LingoLegacyApp());
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    expect(find.text('THE LINGO LEGACY'), findsOneWidget);
    expect(find.text('The Lingo\nUniverse Hub'), findsOneWidget);
    expect(find.text('CHOOSE YOUR DESTINATION'), findsOneWidget);
    expect(find.text('Games & Play'), findsOneWidget);
    expect(find.text('Stories & Books'), findsOneWidget);
  });

  testWidgets('account action clearly states preview-only availability on mobile without overflow', (tester) async {
    tester.view.physicalSize = const Size(375, 812);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const LingoLegacyApp());
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    await tester.tap(find.text('Account'));
    await tester.pumpAndSettle();

    expect(
      find.text('Account and signup services are not connected in this preview.'),
      findsOneWidget,
    );
    expect(tester.takeException(), isNull);
  });
}
