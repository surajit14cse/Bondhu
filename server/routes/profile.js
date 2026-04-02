const express = require('express');
const User = require('../models/User');
const { Interaction, Match } = require('../models/Chat');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

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

router.put('/update', auth, async (req, res) => {
  try {
    await User.update(req.body, { where: { id: req.user.id } });
    const updatedUser = await User.findByPk(req.user.id);
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: 'Error updating profile' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

router.get('/discovery', auth, async (req, res) => {
  try {
    const { gender, minAge, maxAge } = req.query;
    
    // Find already interacted user IDs
    const interactions = await Interaction.findAll({
      where: { userId: req.user.id },
      attributes: ['targetId']
    });
    const interactedIds = interactions.map(i => i.targetId);

    let whereClause = {
      id: { [Op.notIn]: [...interactedIds, req.user.id] }
    };

    if (gender && gender !== 'all') whereClause.gender = gender;
    if (minAge || maxAge) {
      whereClause.age = {};
      if (minAge) whereClause.age[Op.gte] = parseInt(minAge);
      if (maxAge) whereClause.age[Op.lte] = parseInt(maxAge);
    }

    const users = await User.findAll({ where: whereClause, limit: 20 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching discovery' });
  }
});

router.post('/like', auth, async (req, res) => {
  const { targetId } = req.body;
  try {
    await Interaction.create({ userId: req.user.id, targetId, type: 'like' });

    // Check for mutual like
    const mutualLike = await Interaction.findOne({
      where: { userId: targetId, targetId: req.user.id, type: 'like' }
    });

    if (mutualLike) {
      const newMatch = await Match.create();
      await newMatch.addUsers([req.user.id, targetId]);
      const targetUser = await User.findByPk(targetId);
      return res.json({ match: true, matchId: newMatch.id, target: targetUser });
    }

    res.json({ match: false });
  } catch (err) {
    res.status(500).json({ error: 'Error processing like' });
  }
});

router.post('/dislike', auth, async (req, res) => {
  const { targetId } = req.body;
  try {
    await Interaction.create({ userId: req.user.id, targetId, type: 'dislike' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error processing dislike' });
  }
});

router.get('/matches', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Match,
        include: [{
          model: User,
          where: { id: { [Op.ne]: req.user.id } },
          attributes: ['id', 'name', 'age', 'bio', 'images']
        }]
      }]
    });
    
    const formattedMatches = user.Matches.map(match => ({
      _id: match.id,
      otherUser: match.Users[0]
    }));
    
    res.json(formattedMatches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching matches' });
  }
});

module.exports = router;
