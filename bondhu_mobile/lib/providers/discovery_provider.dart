import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../config/api_constants.dart';

class DiscoveryProvider with ChangeNotifier {
  List<UserModel> _users = [];
  bool _isLoading = false;
  String? _matchedUser;

  List<UserModel> get users => _users;
  bool get isLoading => _isLoading;
  String? get matchedUser => _matchedUser;

  Future<void> fetchDiscovery({
    String gender = 'all',
    int minAge = 18,
    int maxAge = 50,
    int distance = 50,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await ApiService.get(ApiConstants.discovery, {
        'gender': gender,
        'minAge': minAge,
        'maxAge': maxAge,
        'distance': distance,
      });

      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _users = data.map((json) => UserModel.fromJson(json)).toList();
      }
    } catch (e) {
      debugPrint('Discovery fetch error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> swipeUser(String targetUserId, String type) async {
    // type: 'like', 'pass', 'superlike'
    try {
      final res = await ApiService.post(ApiConstants.swipe, {
        'targetId': targetUserId,
        'type': type,
      });

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        // Remove swiped user from list
        _users.removeWhere((u) => u.id == targetUserId);
        notifyListeners();
        return data; // contains match: true/false
      }
    } catch (e) {
      debugPrint('Swipe error: $e');
    }
    return null;
  }
}
