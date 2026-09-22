import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/chat_provider.dart';
import '../../providers/auth_provider.dart';
import '../chat/chat_screen.dart';

class MatchesScreen extends StatefulWidget {
  const MatchesScreen({Key? key}) : super(key: key);

  @override
  State<MatchesScreen> createState() => _MatchesScreenState();
}

class _MatchesScreenState extends State<MatchesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
      if (user != null) {
        Provider.of<ChatProvider>(context, listen: false).fetchMatches(user.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Matches & Messages',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Consumer<ChatProvider>(
        builder: (context, provider, child) {
          if (provider.isLoadingMatches) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFFFF385C)));
          }

          if (provider.matches.isEmpty) {
            return const Center(
              child: Text('No matches yet. Keep swiping!'),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.symmetric(vertical: 12),
            itemCount: provider.matches.length,
            separatorBuilder: (ctx, i) => const Divider(indent: 80, height: 1),
            itemBuilder: (context, index) {
              final match = provider.matches[index];
              final imgUrl = match.otherUserImage ??
                  'https://api.dicebear.com/7.x/avataaars/png?seed=${match.otherUserName}';

              return ListTile(
                leading: CircleAvatar(
                  radius: 28,
                  backgroundImage: CachedNetworkImageProvider(imgUrl),
                ),
                title: Text(
                  match.otherUserName,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                subtitle: Text(
                  match.lastMessage ?? 'New match! Send a message ✨',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: match.lastMessage == null ? const Color(0xFFFF385C) : Colors.grey[600],
                    fontWeight: match.lastMessage == null ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ChatScreen(
                        matchId: match.id,
                        otherUserName: match.otherUserName,
                        otherUserImage: match.otherUserImage,
                      ),
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}
