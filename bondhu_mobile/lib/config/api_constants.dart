import 'dart:io';

class ApiConstants {
  // Use 10.0.2.2 when running on Android Emulator to reach PC localhost.
  // Use PC local LAN IP (e.g. 192.168.1.X) when running on physical device.
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
  }

  static String get socketUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:5000';
    }
    return 'http://localhost:5000';
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
