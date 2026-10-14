import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

void main() => runApp(const OasisApp());

class OasisApp extends StatelessWidget {
  const OasisApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: "DOUGHBOY'S OASIS",
    theme: ThemeData.dark(useMaterial3: true).copyWith(
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFF0C56B), brightness: Brightness.dark),
      scaffoldBackgroundColor: const Color(0xFF101718),
    ),
    home: const OasisHome(),
  );
}

class StoreItem {
  const StoreItem(this.id, this.name, this.category, this.price, this.icon);
  final String id, name, category, icon;
  final int price;
}

const catalog = <StoreItem>[
  StoreItem('tee-legacy','Legacy Block Tee','Clothing',35,'👕'),
  StoreItem('hoodie-copper','Copperline Hoodie','Clothing',80,'🧥'),
  StoreItem('backpack','Everyday Utility Pack','Gear',55,'🎒'),
  StoreItem('bike','Neighborhood Bike','Transport',140,'🚲'),
  StoreItem('budgetbook','Pocket Budget Book','Banking',25,'📒'),
  StoreItem('repairkit','Street Repair Kit','Tools',75,'🧰'),
  StoreItem('mapcase','Waterproof Map Case','Tools',40,'🗺️'),
];

class OasisHome extends StatefulWidget {
  const OasisHome({super.key});
  @override
  State<OasisHome> createState() => _OasisHomeState();
}

class _OasisHomeState extends State<OasisHome> {
  int balance = 120;
  final Set<String> owned = <String>{};
  final MapController mapController = MapController();
  LatLng? currentLocation;
  String status = 'Offline demo mode · purchases are local and have no cash value';
  bool locationBusy = false;

  void buy(StoreItem item) {
    if (owned.contains(item.id)) { setState(() => status = 'Already owned: ${item.name}'); return; }
    if (balance < item.price) { setState(() => status = 'Earn more DOUGH in the game before buying this item.'); return; }
    setState(() {
      balance -= item.price;
      owned.add(item.id);
      status = '${item.name} added to this session. No real payment was made.';
    });
  }

  Future<void> locateMe() async {
    if (locationBusy) return;
    setState(() { locationBusy = true; status = 'Checking foreground location permission…'; });
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() => status = 'Location services are off. The fictional map remains available.');
        return;
      }
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
        setState(() => status = 'Location permission not granted. You can continue without GPS.');
        return;
      }
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.low, timeLimit: Duration(seconds: 12)),
      );
      if (!mounted) return;
      final point = LatLng(position.latitude, position.longitude);
      setState(() { currentLocation = point; status = 'Location shown for this session only; it is not saved or sent to a server.'; });
      mapController.move(point, 14);
    } catch (_) {
      if (mounted) setState(() => status = 'Could not read location. The fictional map remains available.');
    } finally {
      if (mounted) setState(() => locationBusy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text("OASIS EXCHANGE"), subtitle: const Text('Amity Heights · Web/mobile starter')),
    body: SafeArea(child: LayoutBuilder(builder: (context, box) {
      final columns = box.maxWidth >= 900 ? 3 : box.maxWidth >= 560 ? 2 : 1;
      return ListView(padding: const EdgeInsets.all(16), children: [
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('AVAILABLE DEMO DOUGH', style: TextStyle(letterSpacing: 2, fontSize: 11)),
          Text('$balance DOUGH', style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: const Color(0xFFF0C56B))),
          const Text('Virtual game currency only · no real payments, deposits or cash-out.'),
          const SizedBox(height: 8),
          Text(status, semanticsLabel: 'Status: $status'),
        ]))),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: columns, childAspectRatio: 1.45, crossAxisSpacing: 10, mainAxisSpacing: 10),
          itemCount: catalog.length,
          itemBuilder: (context, index) {
            final item = catalog[index];
            final isOwned = owned.contains(item.id);
            return Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(item.icon, style: const TextStyle(fontSize: 27)),
              Text(item.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold)),
              Text('${item.category} · ${item.price} DOUGH', style: Theme.of(context).textTheme.bodySmall),
              const Spacer(),
              SizedBox(width: double.infinity, child: FilledButton(
                onPressed: isOwned ? null : () => buy(item),
                child: Text(isOwned ? 'Owned' : 'Buy with DOUGH'),
              )),
            ])));
          },
        ),
        const SizedBox(height: 16),
        Text('Map & optional location', style: Theme.of(context).textTheme.titleLarge),
        const Text('The map is usable without GPS. Only tap Enable my location if you want to center the map on your current location. Coordinates are held in memory for this session only.'),
        const SizedBox(height: 8),
        Wrap(spacing: 8, children: [
          FilledButton.icon(onPressed: locationBusy ? null : locateMe, icon: const Icon(Icons.my_location), label: Text(locationBusy ? 'Checking…' : 'Enable my location')),
          OutlinedButton(onPressed: () { setState(() { currentLocation = null; status = 'Location cleared from this session. You can continue without GPS.'; }); mapController.move(const LatLng(39.43, -75.23), 12); }, child: const Text('Clear location')),
        ]),
        const SizedBox(height: 10),
        SizedBox(height: 320, child: ClipRRect(borderRadius: BorderRadius.circular(12), child: FlutterMap(
          mapController: mapController,
          options: const MapOptions(initialCenter: LatLng(39.43, -75.23), initialZoom: 11),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.thelingolegacy.doughboysoasis',
            ),
            if (currentLocation != null) MarkerLayer(markers: [
              Marker(point: currentLocation!, width: 44, height: 44, child: const Icon(Icons.location_pin, color: Color(0xFFF0C56B), size: 40)),
            ]),
            const RichAttributionWidget(attributions: [TextSourceAttribution('© OpenStreetMap contributors')]),
          ],
        ))),
        const SizedBox(height: 8),
        const Text('Map tiles require network access and provider terms/attribution. GPS is foreground-only and optional. This starter does not send or persist coordinates.'),
      ]);
    })),
  );
}
