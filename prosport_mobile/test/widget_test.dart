// Basic smoke test for the ProSport test app.

import 'package:flutter_test/flutter_test.dart';

import 'package:prosport_mobile/main.dart';

void main() {
  testWidgets('LandingTestPage renders form smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const ProSportApp());

    expect(find.text('Teste generateLanding'), findsOneWidget);
    expect(find.text('Gerar Landing'), findsOneWidget);
  });
}
