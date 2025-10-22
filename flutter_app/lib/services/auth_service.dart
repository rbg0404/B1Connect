import 'package:flutter/foundation.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  bool _isAuthenticated = false;
  String? _username;
  String? _environment;
  
  bool get isAuthenticated => _isAuthenticated;
  String? get username => _username;
  String? get environment => _environment;
  
  Future<bool> login({
    required String username,
    required String password,
    required String database,
    required String environment,
  }) async {
    final response = await ApiService.login(
      username: username,
      password: password,
      database: database,
      environment: environment,
    );
    
    if (response.success) {
      _isAuthenticated = true;
      _username = username;
      _environment = environment;
      notifyListeners();
      return true;
    }
    return false;
  }
  
  Future<void> logout() async {
    await ApiService.logout();
    _isAuthenticated = false;
    _username = null;
    _environment = null;
    notifyListeners();
  }
}
