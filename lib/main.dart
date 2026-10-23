import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const LingoLegacyApp());
}

const gold = Color(0xFFE6BD58);
const cyan = Color(0xFF54E7F2);
const violet = Color(0xFF9871FF);
const ink = Color(0xFF08090E);
const muted = Color(0xFFAAB3C7);

class LingoLegacyApp extends StatelessWidget {
  const LingoLegacyApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'The Lingo Legacy',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: ink,
      colorScheme: const ColorScheme.dark(primary: gold, secondary: cyan, surface: Color(0xFF111522)),
      useMaterial3: true,
      cardTheme: CardThemeData(color: const Color(0xFF111522), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22), side: const BorderSide(color: Color(0xFF30384B)))),
    ),
    home: const UniverseHome(),
  );
}

class Destination {
  final String title, description, icon, route;
  const Destination(this.title, this.description, this.icon, this.route);
}

const destinations = <Destination>[
  Destination('Worlds', 'Explore connected Lingo destinations.', '🌐', 'worlds'),
  Destination('Games & Play', 'That’s My Lingo and LINGOarcade.', '🎮', 'games'),
  Destination('Stories & Books', 'Kotton’s Code and original stories.', '📚', 'library'),
  Destination('Loyalty Lane', 'Apparel and collection discovery.', '✦', 'apparel'),
  Destination('Music & Media', 'The Rise of Zavione and creator media.', '♫', 'media'),
  Destination('askLINGO', 'AI discovery; availability depends on runtime.', '✧', 'ai'),
  Destination('Creator Studio', 'Creative tools and project discovery.', '🎨', 'studio'),
  Destination('Community', 'Spotlights, projects, and future events.', '◎', 'community'),
];

class UniverseHome extends StatefulWidget {
  const UniverseHome({super.key});
  @override
  State<UniverseHome> createState() => _UniverseHomeState();
}

class _UniverseHomeState extends State<UniverseHome> {
  int selected = 0;
  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.sizeOf(context).width >= 760;
    return Scaffold(
      appBar: AppBar(
        title: const Row(children: [Icon(Icons.public, color: cyan), SizedBox(width: 10), Flexible(child: Text('THE LINGO LEGACY', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: -0.5)))]),
        actions: [IconButton(tooltip: 'About this preview', onPressed: () => _notice('Universe Hub mobile preview'), icon: const Icon(Icons.info_outline))],
      ),
      body: SafeArea(child: Center(child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 1100),
        child: CustomScrollView(slivers: [
          SliverToBoxAdapter(child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 28, 20, 18),
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(30),
                border: Border.all(color: const Color(0x44303C55)),
                gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF242044), Color(0xFF101725), ink]),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('ONE UNIVERSE · MANY DESTINATIONS', style: TextStyle(color: cyan, fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1.6)),
                const SizedBox(height: 16),
                const Text('The Lingo\nUniverse Hub', style: TextStyle(fontSize: 42, height: 0.98, fontWeight: FontWeight.w900, letterSpacing: -2)),
                const SizedBox(height: 14),
                const Text('Explore worlds, discover stories, play, build, and connect — all from one home.', style: TextStyle(color: muted, height: 1.5)),
                const SizedBox(height: 20),
                Wrap(spacing: 10, runSpacing: 8, children: [
                  FilledButton.icon(onPressed: () => setState(() => selected = 0), icon: const Icon(Icons.explore_outlined), label: const Text('Explore destinations')),
                  OutlinedButton.icon(onPressed: () => _notice('Account and signup services are not connected in this preview.'), icon: const Icon(Icons.person_outline), label: const Text('Account')),
                ]),
              ]),
            ),
          )),
          SliverToBoxAdapter(child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 14),
            child: Text('CHOOSE YOUR DESTINATION', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900, letterSpacing: 1.1)),
          )),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverGrid(
              delegate: SliverChildBuilderDelegate((context, index) {
                final d = destinations[index];
                final active = selected == index;
                return Semantics(
                  button: true,
                  label: d.title,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(22),
                    onTap: () { setState(() => selected = index); _openDestination(d); },
                    child: Container(
                      padding: const EdgeInsets.all(17),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(color: active ? cyan.withValues(alpha: .7) : const Color(0xFF30384B)),
                        gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: active ? [const Color(0xFF1C3340), const Color(0xFF17162B)] : [const Color(0xFF151A28), const Color(0xFF0D101A)]),
                      ),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(d.icon, style: const TextStyle(fontSize: 27)),
                        const Spacer(),
                        Text(d.title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
                        const SizedBox(height: 6),
                        Text(d.description, maxLines: 3, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: muted, height: 1.4)),
                        const SizedBox(height: 10),
                        const Row(children: [Text('EXPLORE', style: TextStyle(color: cyan, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)), Spacer(), Icon(Icons.arrow_forward, color: cyan, size: 17)]),
                      ]),
                    ),
                  ),
                );
              }, childCount: destinations.length),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: isWide ? 4 : (MediaQuery.sizeOf(context).width < 390 ? 2 : 2),
                mainAxisSpacing: 12, crossAxisSpacing: 12, mainAxisExtent: 205,
              ),
            ),
          ),
          SliverToBoxAdapter(child: Padding(
            padding: const EdgeInsets.all(20),
            child: Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFF30384B))),
              child: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('LOYALTY. LEGACY. LANGUAGE.', style: TextStyle(color: gold, fontWeight: FontWeight.w900, letterSpacing: 1.1)),
                SizedBox(height: 8),
                Text('This is the mobile navigation concept. Destination cards are connected to preview-safe information surfaces; production accounts, payments, AI, and gameplay integrations are not claimed active.', style: TextStyle(color: muted, height: 1.5)),
              ]),
            ),
          )),
        ]),
      ))),
      bottomNavigationBar: NavigationBar(
        selectedIndex: selected < 5 ? selected : 0,
        onDestinationSelected: (index) { setState(() => selected = index); _openDestination(destinations[index]); },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.public), label: 'Worlds'),
          NavigationDestination(icon: Icon(Icons.sports_esports_outlined), label: 'Play'),
          NavigationDestination(icon: Icon(Icons.menu_book_outlined), label: 'Stories'),
          NavigationDestination(icon: Icon(Icons.auto_awesome_outlined), label: 'Create'),
          NavigationDestination(icon: Icon(Icons.groups_outlined), label: 'Community'),
        ],
      ),
    );
  }

  void _openDestination(Destination d) {
    final known = {'Worlds': '/worlds/', 'Games & Play': '/games/', 'Stories & Books': '/library/', 'Loyalty Lane': '/lane/', 'Music & Media': '/media/', 'askLINGO': '/ai/', 'Creator Studio': '/studio/', 'Community': '/community/'};
    _notice('${d.title}: website route ${known[d.title] ?? d.route}. Native service integration remains pending.');
  }

  void _notice(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message), behavior: SnackBarBehavior.floating));
  }
}
