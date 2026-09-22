# Bondhu - Flutter Android Conversion Plan

## 1. Overview
The Bondhu platform consists of:
- **Backend (`/server`)**: Node.js, Express, Sequelize (MySQL/SQLite), Socket.io real-time chat, FCM Push notifications.
- **Web Frontend (`/client`)**: React 19, TypeScript, Vite, Framer Motion swiping, Lucide icons.

The objective is to create a complete **Flutter Android project** (`/bondhu_mobile`) that replaces the React client and talks directly to the Node.js backend.

## 2. Directory Structure (`bondhu_mobile`)
```
bondhu_mobile/
├── pubspec.yaml
├── android/
│   └── app/src/main/AndroidManifest.xml
└── lib/
    ├── main.dart
    ├── config/
    │   └── api_constants.dart
    ├── models/
    │   ├── user_model.dart
    │   ├── match_model.dart
    │   └── message_model.dart
    ├── services/
    │   ├── api_service.dart
    │   ├── auth_service.dart
    │   ├── socket_service.dart
    │   └── storage_service.dart
    ├── providers/ (or State controllers)
    │   ├── auth_provider.dart
    │   ├── discovery_provider.dart
    │   └── chat_provider.dart
    ├── screens/
    │   ├── auth/
    │   │   ├── login_screen.dart
    │   │   └── signup_screen.dart
    │   ├── main_navigation_screen.dart
    │   ├── discover/
    │   │   ├── discover_screen.dart
    │   │   └── widgets/
    │   │       ├── swipe_card.dart
    │   │       ├── action_buttons.dart
    │   │       └── match_dialog.dart
    │   ├── matches/
    │   │   └── matches_screen.dart
    │   ├── chat/
    │   │   └── chat_screen.dart
    │   └── profile/
    │       └── profile_screen.dart
    └── widgets/
        ├── custom_button.dart
        ├── custom_text_field.dart
        └── glass_bottom_bar.dart
```

## 3. Core Dependencies (`pubspec.yaml`)
- `dio` or `http`: REST API communication
- `socket_io_client`: Real-time socket events for chat & typing indicators
- `flutter_card_swiper`: Tinder-like card swiping animation
- `flutter_secure_storage`: Encrypted storage for JWT auth tokens
- `cached_network_image`: Smooth image caching
- `image_picker`: Profile photo selection
- `provider`: Clean, maintainable state management
- `intl`: Message timestamps formatting
- `google_fonts`: Modern typography (Outfit / Inter)
