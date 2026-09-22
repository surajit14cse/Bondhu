import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../../providers/chat_provider.dart';
import '../../providers/auth_provider.dart';

class ChatScreen extends StatefulWidget {
  final String matchId;
  final String otherUserName;
  final String? otherUserImage;

  const ChatScreen({
    Key? key,
    required this.matchId,
    required this.otherUserName,
    this.otherUserImage,
  }) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
      if (user != null) {
        Provider.of<ChatProvider>(context, listen: false).enterChat(widget.matchId, user.id);
      }
    });
  }

  @override
  void dispose() {
    Provider.of<ChatProvider>(context, listen: false).leaveChat();
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _textController.text;
    if (text.trim().isEmpty) return;

    final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
    if (user != null) {
      Provider.of<ChatProvider>(context, listen: false).sendMessage(widget.matchId, user.id, text);
      _textController.clear();
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).currentUser;
    final currentUserId = user?.id ?? '';
    final avatarUrl = widget.otherUserImage ??
        'https://api.dicebear.com/7.x/avataaars/png?seed=${widget.otherUserName}';

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundImage: CachedNetworkImageProvider(avatarUrl),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.otherUserName,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                ),
                Consumer<ChatProvider>(
                  builder: (context, chat, _) {
                    return Text(
                      chat.isOtherUserTyping ? 'typing...' : 'Active now',
                      style: TextStyle(
                        fontSize: 12,
                        color: chat.isOtherUserTyping ? const Color(0xFFFF385C) : Colors.grey,
                      ),
                    );
                  },
                ),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: Consumer<ChatProvider>(
              builder: (context, chat, child) {
                WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                  itemCount: chat.messages.length,
                  itemBuilder: (context, index) {
                    final msg = chat.messages[index];
                    final isMe = msg.senderId == currentUserId;

                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
                        decoration: BoxDecoration(
                          color: isMe ? const Color(0xFFFF385C) : Colors.white,
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(18),
                            topRight: const Radius.circular(18),
                            bottomLeft: Radius.circular(isMe ? 18 : 4),
                            bottomRight: Radius.circular(isMe ? 4 : 18),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.04),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          children: [
                            Text(
                              msg.content,
                              style: TextStyle(
                                color: isMe ? Colors.white : Colors.black87,
                                fontSize: 15,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              DateFormat('hh:mm a').format(msg.timestamp),
                              style: TextStyle(
                                fontSize: 10,
                                color: isMe ? Colors.white70 : Colors.black38,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),

          // Message Input Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: TextField(
                        controller: _textController,
                        decoration: const InputDecoration(
                          hintText: 'Type a message...',
                          border: InputBorder.none,
                        ),
                        onChanged: (text) {
                          if (user != null) {
                            if (text.isNotEmpty) {
                              Provider.of<ChatProvider>(context, listen: false)
                                  .onUserTyping(widget.matchId, user.id);
                            } else {
                              Provider.of<ChatProvider>(context, listen: false)
                                  .onUserStopTyping(widget.matchId, user.id);
                            }
                          }
                        },
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: const Color(0xFFFF385C),
                    radius: 22,
                    child: IconButton(
                      icon: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                      onPressed: _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
