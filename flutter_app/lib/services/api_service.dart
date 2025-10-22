import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/api_response.dart';
import '../models/business_partner.dart';
import '../models/item.dart';
import '../models/sales_order.dart';
import '../models/dashboard_stats.dart';
import '../models/database.dart';

class ApiService {
  // Backend API URL - same port for Replit environment
  static const String baseUrl = '/api';
  static String? _token;
  
  static void setToken(String? token) {
    _token = token;
  }
  
  static Map<String, String> _getHeaders() {
    final headers = {'Content-Type': 'application/json'};
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }
  
  static Future<ApiResponse<List<Database>>> getDatabases() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/databases'),
        headers: _getHeaders(),
      );
      
      final json = jsonDecode(response.body);
      return ApiResponse<List<Database>>(
        success: json['success'],
        data: json['data'] != null
            ? (json['data'] as List).map((e) => Database.fromJson(e)).toList()
            : null,
        error: json['error'],
      );
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }
  
  static Future<ApiResponse<dynamic>> login({
    required String username,
    required String password,
    required String database,
    required String environment,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'password': password,
          'database': database,
          'environment': environment,
        }),
      );
      
      final json = jsonDecode(response.body);
      if (json['success'] && json['data'] != null && json['data']['token'] != null) {
        setToken(json['data']['token']);
      }
      return ApiResponse(
        success: json['success'],
        data: json['data'],
        error: json['error'],
      );
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }
  
  static Future<ApiResponse<List<BusinessPartner>>> getBusinessPartners() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/business-partners'),
        headers: _getHeaders(),
      );
      
      final json = jsonDecode(response.body);
      return ApiResponse<List<BusinessPartner>>(
        success: json['success'],
        data: json['data'] != null
            ? (json['data'] as List).map((e) => BusinessPartner.fromJson(e)).toList()
            : null,
        error: json['error'],
      );
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }
  
  static Future<ApiResponse<List<Item>>> getItems() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/items'),
        headers: _getHeaders(),
      );
      
      final json = jsonDecode(response.body);
      return ApiResponse<List<Item>>(
        success: json['success'],
        data: json['data'] != null
            ? (json['data'] as List).map((e) => Item.fromJson(e)).toList()
            : null,
        error: json['error'],
      );
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }
  
  static Future<ApiResponse<List<SalesOrder>>> getSalesOrders() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/sales-orders'),
        headers: _getHeaders(),
      );
      
      final json = jsonDecode(response.body);
      return ApiResponse<List<SalesOrder>>(
        success: json['success'],
        data: json['data'] != null
            ? (json['data'] as List).map((e) => SalesOrder.fromJson(e)).toList()
            : null,
        error: json['error'],
      );
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }
  
  static Future<ApiResponse<DashboardStats>> getDashboardStats() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/dashboard-stats'),
        headers: _getHeaders(),
      );
      
      final json = jsonDecode(response.body);
      return ApiResponse<DashboardStats>(
        success: json['success'],
        data: json['data'] != null
            ? DashboardStats.fromJson(json['data'])
            : null,
        error: json['error'],
      );
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }
  
  static Future<ApiResponse<List<dynamic>>> getLocations() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/locations'),
        headers: _getHeaders(),
      );
      
      final json = jsonDecode(response.body);
      return ApiResponse<List<dynamic>>(
        success: json['success'],
        data: json['data'],
        error: json['error'],
      );
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }
  
  static Future<ApiResponse<List<dynamic>>> getBranches() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/branches'),
        headers: _getHeaders(),
      );
      
      final json = jsonDecode(response.body);
      return ApiResponse<List<dynamic>>(
        success: json['success'],
        data: json['data'],
        error: json['error'],
      );
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }
  
  static Future<ApiResponse<List<dynamic>>> getWarehouses() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/warehouses'),
        headers: _getHeaders(),
      );
      
      final json = jsonDecode(response.body);
      return ApiResponse<List<dynamic>>(
        success: json['success'],
        data: json['data'],
        error: json['error'],
      );
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }
  
  static Future<ApiResponse<dynamic>> logout() async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/logout'),
        headers: _getHeaders(),
      );
      
      final json = jsonDecode(response.body);
      setToken(null);
      return ApiResponse(
        success: json['success'],
        data: json['data'],
        error: json['error'],
      );
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }
}
