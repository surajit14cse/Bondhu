# Bondhu Mobile - Flutter Android App

A social discovery and dating Android application built with **Flutter (Dart)**. It provides a fluid swipe-card experience, real-time messaging, discovery radius adjustments, and profile management connected to the Bondhu backend server.

---

## 📱 Features

- **Tinder-Style Swipe Deck**:
  - Smooth 60/120 FPS draggable profile cards powered by `flutter_card_swiper`.
  - Swipe **Right** to Like, **Left** to Pass, **Up** to Super Like.
  - Interactive Like/Nope feedback and automatic "It's a Match!" celebration modal.
- **Discovery Filter Sheet**:
  - Filter nearby singles by gender preference (Everyone, Men, Women).
  - Configurable maximum discovery radius distance slider (5 km - 100 km).
- **Real-Time 1-on-1 Chat**:
  - Direct bi-directional WebSocket connection via `socket_io_client`.
  - Live typing indicators ("typing...").
  - Message timestamps and read receipts.
  - Built-in **AI Icebreaker Generator** for breaking the ice with new matches.
  - User options menu to block or report inappropriate users.
- **Complete Profile Management**:
  - Dedicated **Edit Profile** screen with real-time field validation.
  - Interactive **Interest / Hobbies Tag Editor** (add & delete removable chips).
  - Age, Gender, Occupation, Education, Bio, and Phone updates.
  - Profile completion progress bar.
- **Settings & Privacy Modals**:
  - **Bondhu Gold VIP** upgrade sheet with feature highlights.
  - **Safety & Privacy** controls (Incognito Mode, Screenshot Protection).
  - Help Center with FAQs on account matching and safety.

---

## 🛠️ Architecture & Tech Stack

```
bondhu_mobile/
├── lib/
│   ├── main.dart                          # App entry point & Theme configuration
│   ├── config/
│   │   └── api_constants.dart             # API base URL & Socket.io host config
│   ├── models/
│   │   ├── user_model.dart                # User JSON serialization
│   │   └── chat_models.dart               # Match & Message models
│   ├── services/
│   │   ├── api_service.dart               # HTTP client with JWT session header injection
│   │   └── socket_service.dart            # Socket.io connection manager
│   ├── providers/
│   │   ├── auth_provider.dart             # Auth session, Login, Signup & Profile updates
│   │   ├── discovery_provider.dart        # Feed fetching & swipe evaluation
│   │   └── chat_provider.dart             # Match list & real-time message stream
│   └── screens/
│       ├── auth/                          # Login and Signup screens
│       ├── main_navigation_screen.dart    # BottomNavigationBar (Discover, Matches, Profile)
│       ├── discover/                      # Card deck & discovery filter modal
│       ├── matches/                       # Active matches & conversations list
│       ├── chat/                          # 1-on-1 live chat room
│       └── profile/                       # User profile & EditProfileScreen
```

---

## ⚙️ Connecting the App to Your Backend

In [lib/config/api_constants.dart](file:///i:/surajitBhai/Bondhu/bondhu_mobile/lib/config/api_constants.dart):

```dart
// For testing on a physical phone on the same Wi-Fi / Hotspot:
static const String serverHost = '192.168.137.1:5000'; // Replace with your computer's IP

// For Android Studio Emulator:
// static const String serverHost = '10.0.2.2:5000';

// For production cloud backend (Render, Railway, etc.):
// static const String serverHost = 'api.yourbondhuapp.com';
```

---

## 📦 Building the APK

### Method 1: Automatic Cloud Build via GitHub Actions (Recommended)
You don't even need Flutter installed on your local machine!
1. Push your changes to the **`test`** branch:
   ```bash
   git push origin test
   ```
2. Navigate to your GitHub repository $\rightarrow$ **Actions** tab.
3. Select the latest **"Build Android APK"** run.
4. Once finished (usually takes ~2-3 minutes), scroll to **Artifacts** at the bottom and download **`bondhu-android-debug-apk`**.
5. Transfer the `.apk` file to your Android phone, tap to install, and launch Bondhu!

### Method 2: Local CLI Build
If you have the Flutter SDK installed on your system:
```bash
cd bondhu_mobile

# 1. Fetch dependencies
flutter pub get

# 2. Build Debug APK
flutter build apk --debug

# Or Build Release APK
flutter build apk --release
```
The compiled APK will be located at:
`build/app/outputs/flutter-apk/app-debug.apk`

---

## 🔑 Permissions Declared
- `android.permission.INTERNET`: For REST API & real-time Socket.IO communication.
- `android.permission.ACCESS_NETWORK_STATE`: For checking network reachability.
- `android.permission.ACCESS_FINE_LOCATION`: For location radius matching.
- `android.permission.CAMERA`: For profile image photo capture.
- `android.permission.READ_EXTERNAL_STORAGE`: For selecting photos from the gallery.
