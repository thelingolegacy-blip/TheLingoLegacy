import 'package:flutter/material.dart';

import 'models/hub.dart';
import 'services/hub_repository.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const LoyaltyLaneCyclesApp());
}

class LoyaltyLaneCyclesApp extends StatelessWidget {
  const LoyaltyLaneCyclesApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'Loyalty Lane Cycles',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF090A0D),
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFC51F3A),
            secondary: Color(0xFFF0C76A),
            surface: Color(0xFF17191F),
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF090A0D),
            foregroundColor: Color(0xFFF0C76A),
            elevation: 0,
          ),
          useMaterial3: true,
        ),
        home: const HubDirectoryScreen(),
      );
}

class HubDirectoryScreen extends StatefulWidget {
  const HubDirectoryScreen({super.key});

  @override
  State<HubDirectoryScreen> createState() => _HubDirectoryScreenState();
}

class _HubDirectoryScreenState extends State<HubDirectoryScreen> {
  final HubRepository _repository = HubRepository();
  late Future<HubDirectory> _directory;

  @override
  void initState() {
    super.initState();
    _directory = _repository.fetchDirectory();
  }

  @override
  void dispose() {
    _repository.dispose();
    super.dispose();
  }

  void _retry() => setState(() => _directory = _repository.fetchDirectory());

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('LOYALTY LANE CYCLES', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.1)),
        ),
        body: FutureBuilder<HubDirectory>(
          future: _directory,
          builder: (context, snapshot) {
            if (snapshot.connectionState != ConnectionState.done) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError || !snapshot.hasData) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    const Icon(Icons.wifi_off, color: Color(0xFFF0C76A), size: 42),
                    const SizedBox(height: 12),
                    const Text('Regional hub directory is not available yet.', textAlign: TextAlign.center),
                    const SizedBox(height: 8),
                    const Text('The API must be deployed and verified before live directory data can load.', textAlign: TextAlign.center, style: TextStyle(color: Colors.white60)),
                    const SizedBox(height: 16),
                    FilledButton(onPressed: _retry, child: const Text('Retry')),
                  ]),
                ),
              );
            }
            final directory = snapshot.data!;
            return RefreshIndicator(
              onRefresh: () async => _retry(),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
                children: [
                  Text(directory.region, style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: const Color(0xFFF0C76A), fontWeight: FontWeight.w900)),
                  const SizedBox(height: 8),
                  Text('${directory.targetHubCount} planned hubs · ${directory.targetOperatingHours}', style: const TextStyle(color: Colors.white70)),
                  const SizedBox(height: 8),
                  const Text('24/7 is the network target. Candidate locations are not confirmed partners or confirmed 24-hour facilities.', style: TextStyle(color: Color(0xFFFFD18A))),
                  const SizedBox(height: 18),
                  for (final city in directory.cities) _CitySection(city: city),
                  const SizedBox(height: 16),
                  Text(directory.note, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                ],
              ),
            );
          },
        ),
      );
}

class _CitySection extends StatelessWidget {
  const _CitySection({required this.city});
  final HubCity city;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 8, top: 10),
            child: Text('${city.city.toUpperCase()} · ${city.hubs.length} HUBS', style: const TextStyle(color: Color(0xFFF0C76A), fontWeight: FontWeight.w900, letterSpacing: 1)),
          ),
          for (final hub in city.hubs)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(hub.name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                  const SizedBox(height: 5),
                  Text(hub.address, style: const TextStyle(color: Colors.white70)),
                  const SizedBox(height: 8),
                  Text('Listed hours: ${hub.listedHours ?? 'Not verified'}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  Text('Target hours: ${hub.targetHours}', style: const TextStyle(color: Color(0xFFF0C76A), fontSize: 12)),
                  const SizedBox(height: 6),
                  const Text('CANDIDATE ONLY · PARTNER APPROVAL PENDING', style: TextStyle(color: Color(0xFFFFD18A), fontSize: 10, fontWeight: FontWeight.w900)),
                ]),
              ),
            ),
        ],
      );
}
