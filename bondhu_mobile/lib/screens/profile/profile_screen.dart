import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/auth_provider.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.currentUser;

    final imgUrl = (user != null && user.images.isNotEmpty)
        ? user.images.first
        : 'https://api.dicebear.com/7.x/avataaars/png?seed=${user?.name ?? 'User'}';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('My Profile', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.black87),
            onPressed: () async {
              await auth.logout();
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (route) => false,
              );
            },
          ),
        ],
      ),
      body: user == null
          ? const Center(child: Text('No profile loaded'))
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                children: [
                  Center(
                    child: Stack(
                      children: [
                        CircleAvatar(
                          radius: 64,
                          backgroundImage: CachedNetworkImageProvider(imgUrl),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: CircleAvatar(
                            radius: 18,
                            backgroundColor: const Color(0xFFFF385C),
                            child: const Icon(Icons.edit, size: 18, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '${user.name}, ${user.age}',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  if (user.occupation != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      user.occupation!,
                      style: TextStyle(color: Colors.grey[600], fontSize: 15),
                    ),
                  ],
                  const SizedBox(height: 24),
                  _buildSection(
                    title: 'Bio',
                    content: user.bio ?? 'Tell people something about yourself...',
                  ),
                  const SizedBox(height: 16),
                  if (user.interests.isNotEmpty) ...[
                    _buildInterests(user.interests),
                    const SizedBox(height: 24),
                  ],
                  _buildSettingTile(Icons.tune_rounded, 'Discovery Settings'),
                  _buildSettingTile(Icons.security_rounded, 'Safety & Security'),
                  _buildSettingTile(Icons.help_outline_rounded, 'Help & Support'),
                ],
              ),
            ),
    );
  }

  Widget _buildSection({required String title, required String content}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          Text(content, style: TextStyle(color: Colors.grey[700], fontSize: 14)),
        ],
      ),
    );
  }

  Widget _buildInterests(List<String> interests) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Interests', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: interests.map((i) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: const Color(0xFFFF385C).withOpacity(0.3)),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Text(
                  i,
                  style: const TextStyle(color: Color(0xFFFF385C), fontSize: 13, fontWeight: FontWeight.w600),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingTile(IconData icon, String title) {
    return ListTile(
      leading: Icon(icon, color: Colors.black87),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
      trailing: const Icon(Icons.chevron_right_rounded, color: Colors.grey),
      onTap: () {},
    );
  }
}
