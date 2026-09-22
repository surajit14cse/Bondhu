import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../config/api_constants.dart';

class SocketService {
  static IO.Socket? _socket;

  static IO.Socket get socket {
    _socket ??= _initSocket();
    return _socket!;
  }

  static IO.Socket _initSocket() {
    final s = IO.io(
      ApiConstants.socketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableAutoConnect()
          .build(),
    );

    s.onConnect((_) {
      print('✅ Connected to Bondhu Socket.IO server');
    });

    s.onDisconnect((_) {
      print('❌ Disconnected from Socket.IO server');
    });

    return s;
  }

  static void joinMatch(String matchId) {
    socket.emit('join_match', matchId);
  }

  static void sendMessage({
    required String matchId,
    required String senderId,
    required String content,
    String type = 'text',
  }) {
    socket.emit('send_message', {
      'matchId': matchId,
      'senderId': senderId,
      'content': content,
      'type': type,
    });
  }

  static void sendTyping(String matchId, String userId) {
    socket.emit('typing', {'matchId': matchId, 'userId': userId});
  }

  static void stopTyping(String matchId, String userId) {
    socket.emit('stop_typing', {'matchId': matchId, 'userId': userId});
  }

  static void markSeen(String matchId, String userId) {
    socket.emit('mark_seen', {'matchId': matchId, 'userId': userId});
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}
