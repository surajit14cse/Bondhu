# Bondhu (বন্ধু) - Dating & Social Discovery Platform

A full-stack dating and social connection platform consisting of a **Node.js + Socket.IO Backend API** and a **Flutter Android Mobile Application**, alongside a **React Web Client**.

---

## 📁 Repository Structure

```
Bondhu/
├── .github/workflows/          # CI/CD Workflows
│   └── flutter-build.yml       # Cloud pipeline that auto-compiles the Android APK
├── bondhu_mobile/              # Flutter Android Native Application
│   ├── lib/                    # Dart application source code
│   │   ├── config/             # API constants & server host endpoints
│   │   ├── models/             # User, Match, and Message models
│   │   ├── providers/          # Riverpod/Provider state controllers
│   │   ├── screens/            # Discover (Swipe), Matches, Chat, Profile & Edit
│   │   └── services/           # HTTP API & Socket.IO clients
│   └── README.md               # Detailed Mobile app & APK setup guide
├── server/                     # Node.js + Express + Socket.IO Backend
│   ├── config/                 # Sequelize database config (SQLite / MySQL)
│   ├── models/                 # User, Chat, Match, Interaction models
│   ├── routes/                 # Auth, Profile, and Chat API routes
│   ├── utils/                  # Icebreakers & Push Notification helpers
│   ├── seed.js                 # Dummy data seeder script
│   └── README.md               # Comprehensive Server documentation
└── client/                     # React 19 + TypeScript + Vite Web Client
```

---

## ⚡ Quick Start

### 1. Start the Backend Server
```bash
cd server
npm install
node seed.js     # Seeds test profiles (optional)
npm start        # Launches API & Socket.IO on port 5000
```
Server runs at `http://localhost:5000`.

### 2. Run / Build the Flutter Android App
- **Cloud Build**: Simply push to the `test` branch on GitHub. GitHub Actions will compile the Android APK and upload it under the **Artifacts** section!
- **Local Run**:
  ```bash
  cd bondhu_mobile
  flutter pub get
  flutter run
  ```

---

## 📖 Detailed Guides
- 📄 [Server Documentation](file:///i:/surajitBhai/Bondhu/server/README.md)
- 📱 [Mobile App & APK Documentation](file:///i:/surajitBhai/Bondhu/bondhu_mobile/README.md)
- 📋 [Conversion Architecture Plan](file:///i:/surajitBhai/Bondhu/FLUTTER_CONVERSION_PLAN.md)
