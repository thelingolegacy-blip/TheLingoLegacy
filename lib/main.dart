import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'services/studio_world_service.dart';
import 'widgets/ask_lingo_dock.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  var cloudReady = false;
  var cloudStatus = 'Preview mode · Firebase runtime configuration is unavailable';
  try {
    await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
    cloudReady = true;
    cloudStatus = 'Firebase initialized · service-specific acceptance still required';
  } catch (_) {
    // Keep the visual preview usable without implying cloud identity or sync.
    cloudReady = false;
  }
  runApp(LingoLegacyApp(cloudReady: cloudReady, cloudStatus: cloudStatus));
}

const gold = Color(0xFFE6BD58);
const cyan = Color(0xFF54E7F2);
const violet = Color(0xFF9871FF);
const ink = Color(0xFF08090E);
const muted = Color(0xFFAAB3C7);

class LingoLegacyApp extends StatelessWidget {
  const LingoLegacyApp({super.key, required this.cloudReady, required this.cloudStatus});

  final bool cloudReady;
  final String cloudStatus;

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
    home: UniverseHome(cloudReady: cloudReady, cloudStatus: cloudStatus),
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
  const UniverseHome({super.key, required this.cloudReady, required this.cloudStatus});

  final bool cloudReady;
  final String cloudStatus;

  @override
  State<UniverseHome> createState() => _UniverseHomeState();
}

class _UniverseHomeState extends State<UniverseHome> {
  int selected = 0;
  late final Future<List<StudioWorld>> _worldsFuture;

  @override
  void initState() {
    super.initState();
    _worldsFuture = StudioWorldService().fetchWorlds();
  }
  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.sizeOf(context).width >= 760;
    return Scaffold(
      appBar: AppBar(
        title: const Row(children: [Icon(Icons.public, color: cyan), SizedBox(width: 10), Flexible(child: Text('THE LINGO LEGACY', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: -0.5)))]),
        actions: [IconButton(tooltip: 'About this preview', onPressed: () => _notice('Universe Hub mobile preview'), icon: const Icon(Icons.info_outline))],
      ),
      floatingActionButton: const AskLingoDock(),
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
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: widget.cloudReady ? const Color(0xFF3B665E) : const Color(0xFF6B5530)),
                color: const Color(0xFF111522),
              ),
              child: Row(children: [
                Icon(widget.cloudReady ? Icons.cloud_done_outlined : Icons.cloud_off_outlined,
                  color: widget.cloudReady ? const Color(0xFF76D8B2) : gold),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(widget.cloudReady ? 'CLOUD INITIALIZED' : 'PREVIEW MODE',
                    style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1, fontSize: 11)),
                  const SizedBox(height: 4),
                  Text(widget.cloudStatus, style: const TextStyle(color: muted, fontSize: 12, height: 1.4)),
                ])),
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
          SliverToBoxAdapter(child: _buildStudioWorldDirectory(context)),
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

  Widget _buildStudioWorldDirectory(BuildContext context) {
    return FutureBuilder<List<StudioWorld>>(
      future: _worldsFuture,
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          final message = snapshot.connectionState == ConnectionState.waiting
              ? 'Syncing the public studio registry…'
              : 'Edge registry not available yet. The existing preview destinations remain available.';
          return Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
            child: Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF30384B)),
                color: const Color(0xFF111522),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('INDEPENDENT STUDIO WORLDS', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900)),
                const SizedBox(height: 8),
                Text(message, style: const TextStyle(color: muted, height: 1.45)),
              ]),
            ),
          );
        }

        final worlds = snapshot.data!;
        final columns = MediaQuery.sizeOf(context).width >= 900 ? 3 : 2;
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('INDEPENDENT STUDIO WORLDS', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900, letterSpacing: 1)),
            const SizedBox(height: 6),
            Text('${worlds.length} worlds · individual identities · shared platform services',
              style: const TextStyle(color: muted, fontSize: 12)),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: worlds.length,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: columns,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                mainAxisExtent: 156,
              ),
              itemBuilder: (context, index) {
                final world = worlds[index];
                final accent = _worldAccent(world.palette.length > 1 ? world.palette[1] : '#9871FF');
                return Card(
                  child: InkWell(
                    borderRadius: BorderRadius.circular(22),
                    onTap: world.canEnter
                        ? () => Navigator.of(context).push(MaterialPageRoute<void>(
                              builder: (_) => StudioWorldPage(world: world),
                            ))
                        : null,
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(world.id.toUpperCase(),
                          maxLines: 1, overflow: TextOverflow.ellipsis,
                          style: TextStyle(color: accent, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1)),
                        const SizedBox(height: 7),
                        Text(world.entity, maxLines: 2, overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                        const SizedBox(height: 5),
                        Expanded(child: Text(world.studio, maxLines: 2, overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: muted, fontSize: 10, height: 1.3))),
                        Text(_worldStateLabel(world.surfaceState),
                          maxLines: 1, overflow: TextOverflow.ellipsis,
                          style: TextStyle(color: accent, fontSize: 9, fontWeight: FontWeight.w900)),
                      ]),
                    ),
                  ),
                );
              },
            ),
          ]),
        );
      },
    );
  }

  Color _worldAccent(String hex) {
    try {
      final value = hex.replaceAll('#', '');
      if (value.length != 6) return violet;
      return Color(0xFF000000 | int.parse(value, radix: 16));
    } catch (_) {
      return violet;
    }
  }

  String _worldStateLabel(String state) {
    switch (state) {
      case 'preview-present':
        return 'PREVIEW SURFACE';
      case 'local-demo':
        return 'PLAYABLE LOCAL DEMO';
      case 'local-prototype':
        return 'LOCAL PROTOTYPE';
      case 'external-unverified':
        return 'EXTERNAL · UNVERIFIED';
      default:
        return 'PLANNED · NOT ACTIVE';
    }
  }

  void _openDestination(Destination d) {
    final known = {'Worlds': '/worlds/', 'Games & Play': '/games/', 'Stories & Books': '/library/', 'Loyalty Lane': '/lane/', 'Music & Media': '/media/', 'askLINGO': '/ai/', 'Creator Studio': '/studio/', 'Community': '/community/'};
    _notice('${d.title}: preview route ${known[d.title] ?? d.route}. Firebase initialized: ${widget.cloudReady}. Destination service acceptance remains pending.');
  }

  void _notice(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message), behavior: SnackBarBehavior.floating));
  }
}

class StudioWorldPage extends StatelessWidget {
  const StudioWorldPage({super.key, required this.world});

  final StudioWorld world;

  Color get _accent {
    try {
      final value = world.palette.length > 1
          ? world.palette[1].replaceAll('#', '')
          : '9871FF';
      if (value.length != 6) return violet;
      return Color(0xFF000000 | int.parse(value, radix: 16));
    } catch (_) {
      return violet;
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(world.studio)),
        body: SafeArea(
          child: ListView(padding: const EdgeInsets.all(20), children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: _accent.withValues(alpha: .55)),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    _accent.withValues(alpha: .24),
                    const Color(0xFF17162B),
                    ink,
                  ],
                ),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(world.id.toUpperCase(),
                    style: TextStyle(color: _accent, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                const SizedBox(height: 18),
                Text(world.entity,
                    style: const TextStyle(fontSize: 34, height: 1.0, fontWeight: FontWeight.w900)),
                const SizedBox(height: 12),
                Text(world.studio, style: const TextStyle(color: muted)),
                const SizedBox(height: 24),
                Text(world.surfaceState.toUpperCase(),
                    style: TextStyle(color: _accent, fontWeight: FontWeight.w900, letterSpacing: 1)),
              ]),
            ),
            const SizedBox(height: 18),
            Card(child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('WORLD BOUNDARIES', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1)),
                const SizedBox(height: 10),
                const Text('This world owns its visual identity, artwork, audio, navigation surface, and content rules while sharing Lingo ID, progression, wallet controls, telemetry, safety, and release governance.',
                    style: TextStyle(color: muted, height: 1.5)),
                const SizedBox(height: 14),
                Text('Preview route: ${world.route}',
                    style: const TextStyle(color: muted, fontSize: 12)),
              ]),
            )),
            const SizedBox(height: 12),
            const Text('This is a registry-backed studio information surface. Opening the destination application and enabling production services remain separate acceptance gates.',
                style: TextStyle(color: muted, height: 1.5)),
          ]),
        ),
      );
}
