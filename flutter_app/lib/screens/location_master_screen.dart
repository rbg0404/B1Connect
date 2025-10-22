import 'package:flutter/material.dart';
import '../services/api_service.dart';

class LocationMasterScreen extends StatefulWidget {
  const LocationMasterScreen({super.key});

  @override
  State<LocationMasterScreen> createState() => _LocationMasterScreenState();
}

class _LocationMasterScreenState extends State<LocationMasterScreen> {
  List<dynamic> _locations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadLocations();
  }

  Future<void> _loadLocations() async {
    final response = await ApiService.getLocations();
    if (response.success && response.data != null) {
      setState(() {
        _locations = response.data!;
        _isLoading = false;
      });
    } else {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Location Master'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _locations.length,
              itemBuilder: (context, index) {
                final location = _locations[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: const Icon(Icons.location_on, size: 40),
                    title: Text(location['LocationName'] ?? location['Name'] ?? ''),
                    subtitle: Text('Code: ${location['Code'] ?? location['LocationCode'] ?? ''}'),
                  ),
                );
              },
            ),
    );
  }
}
