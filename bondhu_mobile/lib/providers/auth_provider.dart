import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../config/api_constants.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentUser != null;
  String? get errorMessage => _errorMessage;

  Future<bool> checkAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = await ApiService.getToken();
      if (token == null) {
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final res = await ApiService.get(ApiConstants.me);
      if (res.statusCode == 200) {
        _currentUser = UserModel.fromJson(jsonDecode(res.body));
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Auth check error: $e');
    }

    _currentUser = null;
    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> login({String? email, String? phone, required String password}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final body = {
        if (email != null && email.isNotEmpty) 'email': email,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
        'password': password,
      };

      final res = await ApiService.post(ApiConstants.login, body);
      final data = jsonDecode(res.body);

      if (res.statusCode == 200) {
        final token = data['token'];
        final userJson = data['user'];
        await ApiService.saveSession(token, userJson['id'].toString());
        await checkAuth(); // Load full user profile
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = data['error'] ?? 'Login failed';
      }
    } catch (e) {
      _errorMessage = 'Connection error: $e';
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> signup({
    required String name,
    String? email,
    String? phone,
    required String password,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final body = {
        'name': name,
        if (email != null && email.isNotEmpty) 'email': email,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
        'password': password,
      };

      final res = await ApiService.post(ApiConstants.signup, body);
      final data = jsonDecode(res.body);

      if (res.statusCode == 201) {
        final token = data['token'];
        final userJson = data['user'];
        await ApiService.saveSession(token, userJson['id'].toString());
        await checkAuth();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = data['error'] ?? 'Signup failed';
      }
    } catch (e) {
      _errorMessage = 'Connection error: $e';
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await ApiService.clearSession();
    _currentUser = null;
    notifyListeners();
  }

  Future<bool> updateProfile(Map<String, dynamic> updates) async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await ApiService.put(ApiConstants.updateProfile, updates);
      if (res.statusCode == 200) {
        _currentUser = UserModel.fromJson(jsonDecode(res.body));
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Profile update error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }
}
