class MatchModel {
  final String id;
  final String otherUserId;
  final String otherUserName;
  final String? otherUserImage;
  final String? lastMessage;
  final String? lastMessageTime;
  final int unreadCount;

  MatchModel({
    required this.id,
    required this.otherUserId,
    required this.otherUserName,
    this.otherUserImage,
    this.lastMessage,
    this.lastMessageTime,
    this.unreadCount = 0,
  });

  factory MatchModel.fromJson(Map<String, dynamic> json, String currentUserId) {
    // Handling Sequelize Match with included Users
    final users = json['Users'] as List? ?? [];
    Map<String, dynamic>? other;
    for (var u in users) {
      if (u['id']?.toString() != currentUserId) {
        other = u as Map<String, dynamic>;
        break;
      }
    }

    final otherUser = other ?? (json['user'] as Map<String, dynamic>? ?? {});
    final images = otherUser['images'];
    String? imgUrl;
    if (images is List && images.isNotEmpty) {
      imgUrl = images[0];
    } else if (images is String && images.isNotEmpty) {
      imgUrl = images;
    }

    return MatchModel(
      id: json['id']?.toString() ?? '',
      otherUserId: otherUser['id']?.toString() ?? '',
      otherUserName: otherUser['name']?.toString() ?? 'Match',
      otherUserImage: imgUrl,
      lastMessage: json['lastMessage']?['content'] ?? json['lastMessage'],
      lastMessageTime: json['updatedAt']?.toString(),
    );
  }
}

class MessageModel {
  final String? id;
  final String matchId;
  final String senderId;
  final String content;
  final String type;
  final String status;
  final DateTime timestamp;

  MessageModel({
    this.id,
    required this.matchId,
    required this.senderId,
    required this.content,
    this.type = 'text',
    this.status = 'sent',
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['id']?.toString(),
      matchId: json['matchId']?.toString() ?? '',
      senderId: json['senderId']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      type: json['type']?.toString() ?? 'text',
      status: json['status']?.toString() ?? 'sent',
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'matchId': matchId,
      'senderId': senderId,
      'content': content,
      'type': type,
      'status': status,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
