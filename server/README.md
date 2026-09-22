# Bondhu Backend API & Real-Time Server

The backend service for the **Bondhu** social matching and dating platform. Built with **Node.js**, **Express**, **Sequelize ORM**, and **Socket.io** for real-time messaging, presence, and typing notifications.

---

## 🚀 Features

- **Authentication**: JWT-based session tokens with password hashing via `bcryptjs`. Supports registration/login with Email or Phone.
- **Dating Discovery Engine**: Profile feeds filtered by gender, age bracket, geolocation distance radius (Haversine formula), and mutual interest tags.
- **Swipe & Match Algorithm**:
  - `like`, `pass`, and `superlike` swipe actions.
  - Automatic bidirectional match detection that creates real-time match records.
- **Real-Time 1-on-1 Chat (`Socket.io`)**:
  - Persistent message history storage.
  - Active room joins (`join_match`).
  - Real-time typing indicators (`typing`, `stop_typing`).
  - Message read receipts (`mark_seen`).
- **AI Icebreakers**: Built-in conversation starter prompt generator.
- **Safety & Moderation**: User blocking and abuse reporting endpoints.
- **Database Flexibility**: Sequelize ORM preconfigured with seamless support for both **SQLite** (zero-configuration development) and **MySQL** (production).

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* **MySQL**: If you want to use MySQL instead of the default local SQLite database.

---

## 🛠️ Installation & Setup

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (`.env`)**:
   Create or verify the `.env` file in the `server/` root:
   ```ini
   PORT=5000
   JWT_SECRET=super_secret_jwt_key_bondhu_2026
   
   # Database Configuration: 'sqlite' or 'mysql'
   DB_DIALECT=sqlite
   DB_STORAGE=./database.sqlite
   
   # If using MySQL:
   # DB_DIALECT=mysql
   # DB_HOST=localhost
   # DB_PORT=3306
   # DB_NAME=bondhu
   # DB_USER=root
   # DB_PASS=your_password
   ```

4. **Seed Sample Dating Profiles** (Optional but Recommended):
   Populate the database with 10 demo profiles across different locations, ages, and interests:
   ```bash
   node seed.js
   ```

5. **Start the Server**:
   - For regular run:
     ```bash
     npm start
     ```
   - For hot-reload development:
     ```bash
     npm run dev
     ```

   You should see:
   ```
   ✅ Database connected & synced
   🚀 Server is running on port 5000
   ```

---

## 🌐 API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new account | `{ "name": "...", "email": "...", "password": "...", "phone": "..." }` |
| `POST` | `/api/auth/login` | Authenticate & get token | `{ "email": "...", "password": "..." }` or `{ "phone": "...", "password": "..." }` |

### 👤 Profile & Discovery (`/api/profile`) *(Requires `Authorization: <token>`)*
| Method | Endpoint | Description | Query / Body Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile/me` | Fetch logged-in user profile | None |
| `PUT` | `/api/profile/update` | Update profile fields | `{ "name", "age", "gender", "bio", "interests", "images", "occupation", ... }` |
| `GET` | `/api/profile/discovery`| Fetch swipeable card feed | `?gender=all&minAge=18&maxAge=50&distance=50` |
| `POST`| `/api/profile/swipe` | Record swipe action | `{ "targetId": "uuid", "type": "like" \| "pass" \| "superlike" }` |
| `GET` | `/api/profile/matches` | Get list of user matches | None |

### 💬 Chat & Messaging (`/api/chat`) *(Requires `Authorization: <token>`)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/chat/:matchId` | Fetch message history & match partner info |
| `POST`| `/api/chat/:matchId` | Send a fallback REST message |
| `GET` | `/api/chat/icebreaker`| Generate random icebreaker prompt |

---

## ⚡ Socket.IO Event Spec

Connect to Socket root: `ws://<server-host>:5000`

- **Client Emits**:
  - `join_match` $\rightarrow$ `(matchId)`: Join private room.
  - `send_message` $\rightarrow$ `{ matchId, senderId, content, type }`: Broadcast message.
  - `typing` $\rightarrow$ `{ matchId, userId }`: User started typing.
  - `stop_typing` $\rightarrow$ `{ matchId, userId }`: User stopped typing.
  - `mark_seen` $\rightarrow$ `{ matchId, userId }`: Update messages to seen status.

- **Server Emits**:
  - `receive_message`: Delivers incoming message payload.
  - `user_typing`: Notifies recipient of typing status.
  - `user_stop_typing`: Removes typing banner.
  - `messages_seen`: Updates checkmarks to read.
