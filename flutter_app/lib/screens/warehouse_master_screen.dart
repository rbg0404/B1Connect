import 'package:flutter/material.dart';
import '../services/api_service.dart';

class WarehouseMasterScreen extends StatefulWidget {
  const WarehouseMasterScreen({super.key});

  @override
  State<WarehouseMasterScreen> createState() => _WarehouseMasterScreenState();
}

class _WarehouseMasterScreenState extends State<WarehouseMasterScreen> {
  List<dynamic> _warehouses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadWarehouses();
  }

  Future<void> _loadWarehouses() async {
    final response = await ApiService.getWarehouses();
    if (response.success && response.data != null) {
      setState(() {
        _warehouses = response.data!;
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
        title: const Text('Warehouse Master'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _warehouses.length,
              itemBuilder: (context, index) {
                final warehouse = _warehouses[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: const Icon(Icons.warehouse, size: 40),
                    title: Text(warehouse['WhsName'] ?? warehouse['WarehouseName'] ?? ''),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Code: ${warehouse['WhsCode'] ?? warehouse['WarehouseCode'] ?? ''}'),
                        if (warehouse['Location'] != null) Text('Location: ${warehouse['Location']}'),
                      ],
                    ),
                    trailing: warehouse['Inactive'] == 'Y'
                        ? const Chip(label: Text('Inactive'), backgroundColor: Colors.red)
                        : null,
                    isThreeLine: true,
                  ),
                );
              },
            ),
    );
  }
}
