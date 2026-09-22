import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_constants.dart';

class ApiService {
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_id');
  }

  static Future<void> saveSession(String token, String userId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setString('user_id', userId);
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': token,
    };
  }

  static Future<http.Response> get(String endpoint, [Map<String, dynamic>? queryParams]) async {
    var uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    if (queryParams != null && queryParams.isNotEmpty) {
      uri = uri.replace(queryParameters: queryParams.map((k, v) => MapEntry(k, v.toString())));
    }
    final headers = await _getHeaders();
    return await http.get(uri, headers: headers);
  }

  static Future<http.Response> post(String endpoint, Map<String, dynamic> body) async {
    final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    final headers = await _getHeaders();
    return await http.post(uri, headers: headers, body: jsonEncode(body));
  }

  static Future<http.Response> put(String endpoint, Map<String, dynamic> body) async {
    final uri = Uri.parse('${ApiConstants.baseUrl}$endpoint');
    final headers = await _getHeaders();
    return await http.put(uri, headers: headers, body: jsonEncode(body));
  }
}
