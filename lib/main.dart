import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const LingoLegacyApp());
}

class LingoLegacyApp extends StatelessWidget {
  const LingoLegacyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Lingo Legacy OS - Zero Outline Studio',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(useMaterial3: true).copyWith(
        scaffoldBackgroundColor: const Color(0xFF070A13),
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        focusColor: Colors.transparent,
        hoverColor: Colors.transparent,
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            elevation: 0,
            shadowColor: Colors.transparent,
            side: BorderSide.none,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            side: BorderSide.none,
            shadowColor: Colors.transparent,
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            side: BorderSide.none,
            shadowColor: Colors.transparent,
          ),
        ),
      ),
      home: const LingoStudioScreen(),
    );
  }
}

class LingoStudioScreen extends StatefulWidget {
  const LingoStudioScreen({super.key});

  @override
  State<LingoStudioScreen> createState() => _LingoStudioScreenState();
}

class _LingoStudioScreenState extends State<LingoStudioScreen> {
  int _selectedNavIndex = 0;
  bool _isProcessingAudio = false;
  bool _purged = false;

  static const _bg = Color(0xFF070A13);
  static const _panel = Color(0xFF0F172A);
  static const _cyan = Color(0xFF00F0FF);
  static const _green = Color(0xFF10B981);
  static const _pink = Color(0xFFFF007F);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final compact = constraints.maxWidth < 760;
            return compact ? _buildCompactLayout() : _buildWideLayout();
          },
        ),
      ),
    );
  }

  Widget _buildWideLayout() {
    return Row(
      children: [
        _buildSidebar(),
        Expanded(child: _buildMainCanvas()),
      ],
    );
  }

  Widget _buildCompactLayout() {
    return Column(
      children: [
        _buildCompactNav(),
        Expanded(child: _buildMainCanvas()),
      ],
    );
  }

  Widget _buildSidebar() {
    return Container(
      width: 250,
      color: _panel,
      padding: const EdgeInsets.fromLTRB(16, 28, 16, 20),
      child: Column(
        children: [
          _buildBrand(),
          const SizedBox(height: 36),
          ..._navItems(),
          const Spacer(),
          const Text(
            'ZERO OUTLINE MODE',
            style: TextStyle(
              color: Color(0xFF475569),
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompactNav() {
    return Container(
      width: double.infinity,
      color: _panel,
      padding: const EdgeInsets.all(14),
      child: Column(
        children: [
          _buildBrand(compact: true),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(children: _navItems(compact: true)),
          ),
        ],
      ),
    );
  }

  Widget _buildBrand({bool compact = false}) {
    return Row(
      mainAxisAlignment:
          compact ? MainAxisAlignment.start : MainAxisAlignment.center,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Container(
            width: 38,
            height: 38,
            color: _cyan.withOpacity(.14),
            alignment: Alignment.center,
            child: const Icon(Icons.spatial_audio_off_rounded, color: _cyan, size: 20),
          ),
        ),
        const SizedBox(width: 12),
        const Text(
          'LINGO OS',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
          ),
        ),
      ],
    );
  }

  List<Widget> _navItems({bool compact = false}) {
    const items = [
      (Icons.dashboard_rounded, 'Dashboard'),
      (Icons.record_voice_over_rounded, 'Studio Mic'),
      (Icons.graphic_eq_rounded, 'Waveforms'),
      (Icons.translate_rounded, 'Localization'),
      (Icons.settings_rounded, 'OS Settings'),
    ];

    return [
      for (var i = 0; i < items.length; i++)
        Padding(
          padding: EdgeInsets.symmetric(vertical: compact ? 0 : 3, horizontal: compact ? 3 : 0),
          child: _buildNavItem(i, items[i].$1, items[i].$2, compact),
        ),
    ];
  }

  Widget _buildNavItem(int index, IconData icon, String label, bool compact) {
    final selected = _selectedNavIndex == index;
    return Focus(
      descendantsAreFocusable: false,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => setState(() => _selectedNavIndex = index),
          splashColor: Colors.transparent,
          highlightColor: Colors.transparent,
          hoverColor: Colors.transparent,
          focusColor: Colors.transparent,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            decoration: BoxDecoration(
              color: selected ? _cyan.withOpacity(.12) : Colors.transparent,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              mainAxisSize: compact ? MainAxisSize.min : MainAxisSize.max,
              children: [
                Icon(icon, size: 19, color: selected ? _cyan : const Color(0xFF64748B)),
                if (!compact) const SizedBox(width: 12),
                if (!compact)
                  Text(
                    label,
                    style: TextStyle(
                      color: selected ? Colors.white : const Color(0xFF94A3B8),
                      fontSize: 13,
                      fontWeight: selected ? FontWeight.w800 : FontWeight.w500,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMainCanvas() {
    return Column(
      children: [
        _buildTopBar(),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1220),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildHero(),
                    const SizedBox(height: 22),
                    _buildControls(),
                    const SizedBox(height: 22),
                    _buildDiagnostics(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTopBar() {
    return Container(
      height: 70,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      color: _bg,
      child: Row(
        children: [
          const Expanded(
            child: Text(
              'Lingo Legacy OS / Clean Studio Canvas',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w600),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          _button(
            'Export Voicepack',
            Icons.file_download_outlined,
            _cyan,
            const Color(0xFF070A13),
            () {},
          ),
        ],
      ),
    );
  }

  Widget _buildHero() {
    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E1B4B), Color(0xFF311042)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: _green.withOpacity(.16),
              borderRadius: BorderRadius.circular(999),
            ),
            child: const Text(
              'ALL 5 FIXES ACTIVE',
              style: TextStyle(color: _green, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Clean Borderless Studio Interface',
            style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          Text(
            'Button outlines, container borders, focus highlights, asset fringe edges, and debug layout artifacts are suppressed.',
            style: TextStyle(color: Colors.white.withOpacity(.68), fontSize: 14, height: 1.55),
          ),
        ],
      ),
    );
  }

  Widget _buildControls() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final stacked = constraints.maxWidth < 650;
        final children = [
          _buildControlPanel(
            'Studio Audio Capture',
            'Control the studio capture state without introducing visual outlines.',
            _isProcessingAudio ? 'Stop Recording' : 'Start Audio Capture',
            _isProcessingAudio ? Icons.stop_rounded : Icons.mic_rounded,
            _isProcessingAudio ? _pink : _cyan,
            () => setState(() => _isProcessingAudio = !_isProcessingAudio),
          ),
          _buildControlPanel(
            'Artifact Purge Filter',
            'Run the visual cleanup pass and verify the zero-outline presentation contract.',
            'Purge Outline Artifacts',
            Icons.cleaning_services_rounded,
            _green,
            () => setState(() => _purged = true),
            status: _purged ? 'PURGED' : 'STANDBY',
          ),
        ];

        if (stacked) return Column(children: [children[0], const SizedBox(height: 16), children[1]]);
        return Row(children: [Expanded(child: children[0]), const SizedBox(width: 16), Expanded(child: children[1])]);
      },
    );
  }

  Widget _buildControlPanel(
    String title,
    String description,
    String action,
    IconData icon,
    Color color,
    VoidCallback onPressed, {
    String status = 'READY',
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: _panel, borderRadius: BorderRadius.circular(20)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800))),
              Text(status, style: const TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1)),
            ],
          ),
          const SizedBox(height: 9),
          Text(description, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, height: 1.5)),
          const SizedBox(height: 18),
          _button(action, icon, color, Colors.white, onPressed),
        ],
      ),
    );
  }

  Widget _buildDiagnostics() {
    const diagnostics = [
      ('1. Button Outlines', 'side: BorderSide.none'),
      ('2. Container Borders', 'border: null'),
      ('3. InkWell Splash', 'splashColor: transparent'),
      ('4. Asset Edges', 'ClipRRect Alpha Mask'),
      ('5. Debug Grid', 'debugPaintSize = false'),
    ];

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: _panel, borderRadius: BorderRadius.circular(20)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Layer Diagnostics & Fix Verification', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800)),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              for (final item in diagnostics)
                Container(
                  width: 190,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: _bg, borderRadius: BorderRadius.circular(12)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.$1, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 5),
                      Text(item.$2, style: const TextStyle(color: _cyan, fontSize: 10, fontFamily: 'monospace')),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _button(String label, IconData icon, Color color, Color textColor, VoidCallback onPressed) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 18, color: textColor),
      label: Text(label, style: TextStyle(color: textColor, fontWeight: FontWeight.w800)),
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: textColor,
        elevation: 0,
        shadowColor: Colors.transparent,
        side: BorderSide.none,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 13),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    );
  }
}
