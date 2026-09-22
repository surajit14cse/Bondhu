import 'package:flutter/material.dart';
import 'discover/discover_screen.dart';
import 'matches/matches_screen.dart';
import 'profile/profile_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({Key? key}) : super(key: key);

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    DiscoverScreen(),
    MatchesScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (index) => setState(() => _currentIndex = index),
              elevation: 0,
              backgroundColor: Colors.transparent,
              selectedItemColor: const Color(0xFFFF385C),
              unselectedItemColor: Colors.grey[400],
              selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.explore_outlined),
                  activeIcon: Icon(Icons.explore),
                  label: 'Discover',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.favorite_border_rounded),
                  activeIcon: Icon(Icons.favorite_rounded),
                  label: 'Matches',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.person_outline_rounded),
                  activeIcon: Icon(Icons.person_rounded),
                  label: 'Profile',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
