import 'dart:io';

class ApiConstants {
  // PC IP for physical phone on the same hotspot/Wi-Fi network
  static const String serverHost = '192.168.137.1:5000';

  static String get baseUrl {
    return 'http://$serverHost/api';
  }

  static String get socketUrl {
    return 'http://$serverHost';
  }

  // Endpoints
  static const String signup = '/auth/signup';
  static const String login = '/auth/login';
  static const String me = '/profile/me';
  static const String updateProfile = '/profile/update';
  static const String discovery = '/profile/discovery';
  static const String swipe = '/profile/swipe';
  static const String matches = '/profile/matches';
  static const String chat = '/chat';
  static const String icebreaker = '/chat/icebreaker';
}
