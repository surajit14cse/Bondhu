const express = require('express');
const { Match, Message } = require('../models/Chat');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

router.get('/:matchId', auth, async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.matchId, {
      include: [{ model: User, attributes: ['id', 'name'] }]
    });
    const messages = await Message.findAll({ 
      where: { matchId: req.params.matchId },
      order: [['timestamp', 'ASC']]
    });
    const otherUser = match.Users.find(u => u.id !== req.user.id);
    res.json({ messages, otherUser });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

router.post('/:matchId', auth, async (req, res) => {
  try {
    const newMessage = await Message.create({
      matchId: req.params.matchId,
      senderId: req.user.id,
      content: req.body.content,
    });
    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Error sending message' });
  }
});

module.exports = router;
