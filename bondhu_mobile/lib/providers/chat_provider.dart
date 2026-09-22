import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../models/chat_models.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../config/api_constants.dart';

class ChatProvider with ChangeNotifier {
  List<MatchModel> _matches = [];
  List<MessageModel> _messages = [];
  bool _isLoadingMatches = false;
  bool _isOtherUserTyping = false;
  String? _activeMatchId;

  List<MatchModel> get matches => _matches;
  List<MessageModel> get messages => _messages;
  bool get isLoadingMatches => _isLoadingMatches;
  bool get isOtherUserTyping => _isOtherUserTyping;

  Future<void> fetchMatches(String currentUserId) async {
    _isLoadingMatches = true;
    notifyListeners();

    try {
      final res = await ApiService.get(ApiConstants.matches);
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _matches = data.map((json) => MatchModel.fromJson(json, currentUserId)).toList();
      }
    } catch (e) {
      debugPrint('Fetch matches error: $e');
    }

    _isLoadingMatches = false;
    notifyListeners();
  }

  void enterChat(String matchId, String currentUserId) {
    _activeMatchId = matchId;
    _messages = [];
    _isOtherUserTyping = false;

    SocketService.joinMatch(matchId);
    SocketService.markSeen(matchId, currentUserId);
    fetchChatHistory(matchId);

    // Socket listener for new messages
    SocketService.socket.off('receive_message');
    SocketService.socket.on('receive_message', (data) {
      if (data != null && data['matchId'] == _activeMatchId) {
        _messages.add(MessageModel.fromJson(Map<String, dynamic>.from(data)));
        SocketService.markSeen(matchId, currentUserId);
        notifyListeners();
      }
    });

    // Typing indicators
    SocketService.socket.off('user_typing');
    SocketService.socket.on('user_typing', (data) {
      if (data['userId'] != currentUserId) {
        _isOtherUserTyping = true;
        notifyListeners();
      }
    });

    SocketService.socket.off('user_stop_typing');
    SocketService.socket.on('user_stop_typing', (data) {
      if (data['userId'] != currentUserId) {
        _isOtherUserTyping = false;
        notifyListeners();
      }
    });
  }

  Future<void> fetchChatHistory(String matchId) async {
    try {
      final res = await ApiService.get('${ApiConstants.chat}/$matchId');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final List msgs = data['messages'] ?? [];
        _messages = msgs.map((m) => MessageModel.fromJson(m)).toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Chat history error: $e');
    }
  }

  void sendMessage(String matchId, String senderId, String content) {
    if (content.trim().isEmpty) return;
    SocketService.sendMessage(
      matchId: matchId,
      senderId: senderId,
      content: content.trim(),
    );
  }

  void onUserTyping(String matchId, String userId) {
    SocketService.sendTyping(matchId, userId);
  }

  void onUserStopTyping(String matchId, String userId) {
    SocketService.stopTyping(matchId, userId);
  }

  void leaveChat() {
    _activeMatchId = null;
    SocketService.socket.off('receive_message');
    SocketService.socket.off('user_typing');
    SocketService.socket.off('user_stop_typing');
  }
}
