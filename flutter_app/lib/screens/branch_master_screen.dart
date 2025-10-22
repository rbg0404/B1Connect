import 'package:flutter/material.dart';
import '../services/api_service.dart';

class BranchMasterScreen extends StatefulWidget {
  const BranchMasterScreen({super.key});

  @override
  State<BranchMasterScreen> createState() => _BranchMasterScreenState();
}

class _BranchMasterScreenState extends State<BranchMasterScreen> {
  List<dynamic> _branches = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBranches();
  }

  Future<void> _loadBranches() async {
    final response = await ApiService.getBranches();
    if (response.success && response.data != null) {
      setState(() {
        _branches = response.data!;
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
        title: const Text('Branch Master'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _branches.length,
              itemBuilder: (context, index) {
                final branch = _branches[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: const Icon(Icons.account_balance, size: 40),
                    title: Text(branch['Name'] ?? ''),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Code: ${branch['Code'] ?? ''}'),
                        if (branch['City'] != null) Text('City: ${branch['City']}'),
                      ],
                    ),
                    isThreeLine: true,
                  ),
                );
              },
            ),
    );
  }
}
