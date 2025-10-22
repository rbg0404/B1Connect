import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/business_partner.dart';

class BusinessPartnersScreen extends StatefulWidget {
  const BusinessPartnersScreen({super.key});

  @override
  State<BusinessPartnersScreen> createState() => _BusinessPartnersScreenState();
}

class _BusinessPartnersScreenState extends State<BusinessPartnersScreen> {
  List<BusinessPartner> _partners = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPartners();
  }

  Future<void> _loadPartners() async {
    final response = await ApiService.getBusinessPartners();
    if (response.success && response.data != null) {
      setState(() {
        _partners = response.data!;
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
        title: const Text('Business Partners'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _partners.length,
              itemBuilder: (context, index) {
                final partner = _partners[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      child: Text(partner.cardCode.substring(0, 1)),
                    ),
                    title: Text(partner.cardName),
                    subtitle: Text('Code: ${partner.cardCode} | Type: ${partner.cardType}'),
                    trailing: partner.currentAccountBalance != null
                        ? Text(
                            '${partner.currency ?? ''} ${partner.currentAccountBalance!.toStringAsFixed(2)}',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          )
                        : null,
                  ),
                );
              },
            ),
    );
  }
}
