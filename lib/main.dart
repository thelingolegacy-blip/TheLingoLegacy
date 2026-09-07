import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const LingoLegacyApp());
}

class LingoLegacyApp extends StatelessWidget {
  const LingoLegacyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'The Lingo Legacy',
      theme: ThemeData(
        brightness: Brightness.dark,
        useMaterial3: true,
        colorScheme: ColorScheme.dark(
          primary: Color(0xFFF7C84B),
          secondary: Color(0xFF56EFFF),
          surface: Color(0xFF050507),
        ),
      ),
      home: const CasinoDashboard(),
    );
  }
}

class CasinoDashboard extends StatelessWidget {
  const CasinoDashboard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('The Lingo Legacy Casino')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text('Welcome to the Lingo Legacy'),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {},
              child: const Text('Play Casino Game'),
            ),
          ],
        ),
      ),
    );
  }
}
