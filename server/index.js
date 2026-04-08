const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./config/database');
const { Op } = require('sequelize');
const User = require('./models/User');
const { Interaction, Match, Message } = require('./models/Chat');
const { sendPushNotification } = require('./utils/notifications');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ MySQL Database connected & synced');
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database Sync Error:', err);
    console.log('Ensure MySQL is running and you have created the database: bondhu_db');
  });

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_match', (matchId) => {
    socket.join(matchId);
  });

  socket.on('send_message', async (data) => {
    try {
      const message = await Message.create({
        matchId: data.matchId,
        senderId: data.senderId,
        content: data.content,
        type: data.type || 'text',
        status: 'sent'
      });
      data.id = message.id;
      data.timestamp = message.timestamp;
      
      // Emit to room
      io.to(data.matchId).emit('receive_message', data);

      // Push Notification logic
      const match = await Match.findByPk(data.matchId, {
        include: [User]
      });
      const sender = await User.findByPk(data.senderId);
      const recipient = match.Users.find(u => u.id !== data.senderId);

      if (recipient && recipient.fcmToken) {
        sendPushNotification(recipient.fcmToken, `New message from ${sender.name}`, data.content);
      }
    } catch (err) {
      console.error('Error saving socket message:', err);
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.matchId).emit('user_typing', { userId: data.userId });
  });

  socket.on('stop_typing', (data) => {
    socket.to(data.matchId).emit('user_stop_typing', { userId: data.userId });
  });

  socket.on('mark_seen', async (data) => {
    try {
      await Message.update({ status: 'seen' }, { 
        where: { matchId: data.matchId, senderId: { [Op.ne]: data.userId }, status: { [Op.ne]: 'seen' } } 
      });
      socket.to(data.matchId).emit('messages_seen', { matchId: data.matchId, seenBy: data.userId });
    } catch (err) {
      console.error('Error marking messages as seen:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('Bondhu API (MySQL) is running...');
});
