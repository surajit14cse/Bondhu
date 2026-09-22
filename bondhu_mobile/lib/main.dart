import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

import 'providers/auth_provider.dart';
import 'providers/discovery_provider.dart';
import 'providers/chat_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/main_navigation_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const BondhuApp());
}

class BondhuApp extends StatelessWidget {
  const BondhuApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DiscoveryProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
      ],
      child: MaterialApp(
        title: 'Bondhu',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          primaryColor: const Color(0xFFFF385C),
          scaffoldBackgroundColor: Colors.white,
          textTheme: GoogleFonts.interTextTheme(Theme.of(context).textTheme),
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFFFF385C),
            primary: const Color(0xFFFF385C),
          ),
        ),
        home: const AuthGate(),
      ),
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({Key? key}) : super(key: key);

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AuthProvider>(context, listen: false).checkAuth();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    if (auth.isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFFFF385C)),
        ),
      );
    }

    if (auth.isAuthenticated) {
      return const MainNavigationScreen();
    }

    return const LoginScreen();
  }
}
