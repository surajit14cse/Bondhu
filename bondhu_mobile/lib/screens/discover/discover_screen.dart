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
  String _selectedGender = 'all';
  double _distance = 50;

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
        title: const Text('🎉 It\'s a Match! 🎉', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircleAvatar(
              radius: 40,
              backgroundColor: Color(0xFFFFF0F3),
              child: Icon(Icons.favorite_rounded, color: Color(0xFFFF385C), size: 40),
            ),
            const SizedBox(height: 16),
            Text(
              'You and $matchedUserName liked each other.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
          ],
        ),
        actionsAlignment: MainAxisAlignment.center,
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Keep Swiping', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF385C),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
            onPressed: () {
              Navigator.pop(ctx);
            },
            child: const Text('Send a Message', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _openFiltersModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 36),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 5,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Discovery Filters',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text('Interested in', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 10),
                  Row(
                    children: ['all', 'male', 'female'].map((g) {
                      final isSelected = _selectedGender == g;
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: ChoiceChip(
                            label: Center(
                              child: Text(
                                g == 'all' ? 'All' : g[0].toUpperCase() + g.substring(1),
                                style: TextStyle(
                                  color: isSelected ? Colors.white : Colors.black87,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            selected: isSelected,
                            selectedColor: const Color(0xFFFF385C),
                            onSelected: (val) {
                              if (val) {
                                setModalState(() => _selectedGender = g);
                                setState(() => _selectedGender = g);
                              }
                            },
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Maximum Distance', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      Text('${_distance.round()} miles', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFFF385C))),
                    ],
                  ),
                  Slider(
                    value: _distance,
                    min: 5,
                    max: 100,
                    divisions: 19,
                    activeColor: const Color(0xFFFF385C),
                    onChanged: (val) {
                      setModalState(() => _distance = val);
                      setState(() => _distance = val);
                    },
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFF385C),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        Provider.of<DiscoveryProvider>(context, listen: false).fetchDiscovery(
                          gender: _selectedGender,
                          distance: _distance.round(),
                        );
                      },
                      child: const Text('Apply Filters', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
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
            onPressed: _openFiltersModal,
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
                    onPressed: () => provider.fetchDiscovery(gender: _selectedGender, distance: _distance.round()),
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
