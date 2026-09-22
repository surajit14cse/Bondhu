import 'package:flutter/material.dart';
import 'package:flutter_card_swiper/flutter_card_swiper.dart';
import 'package:provider/provider.dart';
import '../../providers/discovery_provider.dart';
import 'widgets/swipe_card.dart';

class DiscoverScreen extends StatefulWidget {
  const DiscoverScreen({Key? key}) : super(key: key);

  @override
  State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  final CardSwiperController _controller = CardSwiperController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<DiscoveryProvider>(context, listen: false).fetchDiscovery();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  bool _onSwipe(
    int previousIndex,
    int? currentIndex,
    CardSwiperDirection direction,
  ) {
    final discovery = Provider.of<DiscoveryProvider>(context, listen: false);
    if (previousIndex < discovery.users.length) {
      final user = discovery.users[previousIndex];
      String type = 'pass';
      if (direction == CardSwiperDirection.right) type = 'like';
      if (direction == CardSwiperDirection.top) type = 'superlike';

      discovery.swipeUser(user.id, type).then((res) {
        if (res != null && res['match'] == true) {
          _showMatchDialog(user.name);
        }
      });
    }
    return true;
  }

  void _showMatchDialog(String matchedUserName) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('🎉 It\'s a Match! 🎉', textAlign: TextAlign.center),
        content: Text(
          'You and $matchedUserName liked each other.',
          textAlign: TextAlign.center,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Keep Swiping'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF385C),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              // Navigate to matches/chat tab
            },
            child: const Text('Say Hi', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        title: const Text(
          'Bondhu',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w900,
            color: Color(0xFFFF385C),
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded, color: Colors.black87),
            onPressed: () {
              // Open discovery filters
            },
          ),
        ],
      ),
      body: Consumer<DiscoveryProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(color: Color(0xFFFF385C)),
            );
          }

          if (provider.users.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.sentiment_dissatisfied_outlined, size: 72, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text(
                    'No more profiles nearby',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
                  const SizedBox(height: 8),
                  const Text('Expand your search radius or change filters.', style: TextStyle(color: Colors.grey)),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () => provider.fetchDiscovery(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF385C),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    child: const Text('Refresh', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            );
          }

          return Column(
            children: [
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: CardSwiper(
                    controller: _controller,
                    cardsCount: provider.users.length,
                    onSwipe: _onSwipe,
                    numberOfCardsDisplayed: provider.users.length > 2 ? 3 : provider.users.length,
                    cardBuilder: (context, index, percentX, percentY) {
                      return SwipeCard(user: provider.users[index]);
                    },
                  ),
                ),
              ),

              // Action Buttons Row (Pass, Super Like, Like)
              Padding(
                padding: const EdgeInsets.only(bottom: 24, top: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildActionButton(
                      icon: Icons.close_rounded,
                      color: Colors.redAccent,
                      size: 28,
                      onTap: () => _controller.swipe(CardSwiperDirection.left),
                    ),
                    const SizedBox(width: 24),
                    _buildActionButton(
                      icon: Icons.star_rounded,
                      color: Colors.blueAccent,
                      size: 24,
                      padding: 12,
                      onTap: () => _controller.swipe(CardSwiperDirection.top),
                    ),
                    const SizedBox(width: 24),
                    _buildActionButton(
                      icon: Icons.favorite_rounded,
                      color: Colors.greenAccent[700]!,
                      size: 28,
                      onTap: () => _controller.swipe(CardSwiperDirection.right),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
    double size = 28,
    double padding = 16,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(padding),
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.2),
              blurRadius: 15,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Icon(icon, color: color, size: size),
      ),
    );
  }
}
