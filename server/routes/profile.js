const express = require('express');
const User = require('../models/User');
const { Interaction, Match, BlockedUser, Report } = require('../models/Chat');
const jwt = require('jsonwebtoken');
const { Op, Sequelize } = require('sequelize');
const { sendPushNotification } = require('../utils/notifications');
const checkPremium = require('../middleware/premium');

const router = express.Router();

const auth = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const user = await User.findByPk(verified.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
};

router.put('/update', auth, async (req, res) => {
  try {
    await User.update(req.body, { where: { id: req.user.id } });
    const updatedUser = await User.findByPk(req.user.id);
    res.json(updatedUser.get({ plain: true }));
  } catch (err) {
    res.status(400).json({ error: 'Error updating profile' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user.get({ plain: true }));
  } catch (err) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

router.get('/discovery', auth, async (req, res) => {
  try {
    const { gender, minAge, maxAge, distance, interests } = req.query;
    const currentUser = req.user;
    
    // Find already interacted user IDs
    const interactions = await Interaction.findAll({
      where: { userId: req.user.id },
      attributes: ['targetId']
    });
    const interactedIds = interactions.map(i => i.targetId);

    // Find blocked users (both ways)
    const blocks = await BlockedUser.findAll({
      where: { [Op.or]: [{ userId: req.user.id }, { blockedId: req.user.id }] }
    });
    const blockedIds = blocks.map(b => b.userId === req.user.id ? b.blockedId : b.userId);

    let whereClause = {
      id: { [Op.notIn]: [...interactedIds, ...blockedIds, req.user.id] }
    };

    if (gender && gender !== 'all') whereClause.gender = gender;
    if (minAge || maxAge) {
      whereClause.age = {};
      if (minAge) whereClause.age[Op.gte] = parseInt(minAge);
      if (maxAge) whereClause.age[Op.lte] = parseInt(maxAge);
    }

    if (interests) {
      const interestsArray = interests.split(',');
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push(Sequelize.literal(`JSON_OVERLAPS(interests, '${JSON.stringify(interestsArray)}')`));
    }

    let attributes = {
      include: []
    };

    if (distance && currentUser.latitude && currentUser.longitude) {
      const lat = currentUser.latitude;
      const lng = currentUser.longitude;
      const radius = parseInt(distance);

      const distanceField = Sequelize.literal(`(
        6371 * acos(
          cos(radians(${lat})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(latitude))
        )
      )`);

      attributes.include.push([distanceField, 'distance']);
      
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push(Sequelize.where(distanceField, { [Op.lte]: radius }));
    }

    let users = await User.findAll({ 
      attributes,
      where: whereClause, 
      limit: 100 // Fetch more for scoring
    });

    // Smart Matching Algorithm
    const scoredUsers = users.map(user => {
      let score = 0;
      const targetUser = user.toJSON();

      // Interests Similarity
      if (currentUser.interests && targetUser.interests) {
        const commonInterests = currentUser.interests.filter(i => targetUser.interests.includes(i));
        score += commonInterests.length * 10;
      }

      // Age Preference
      const ageDiff = Math.abs(currentUser.age - targetUser.age);
      score += Math.max(0, 50 - ageDiff * 2);

      // Activity Level
      if (targetUser.lastActive) {
        const hoursSinceActive = (new Date() - new Date(targetUser.lastActive)) / (1000 * 60 * 60);
        if (hoursSinceActive < 24) score += 20;
        else if (hoursSinceActive < 72) score += 10;
      }

      // Boost Feature
      if (targetUser.boostExpiry && new Date(targetUser.boostExpiry) > new Date()) {
        score += 100; // Boosted users get a large score bonus
      }

      return { ...targetUser, matchScore: score };
    });

    // Sort by matchScore descending
    scoredUsers.sort((a, b) => b.matchScore - a.matchScore);

    res.json(scoredUsers.slice(0, 20)); // Return top 20
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching discovery' });
  }
});

router.post('/swipe', auth, async (req, res) => {
  const { targetId, type } = req.body;
  const user = req.user;

  // Swipe Limit for Free Users
  if (!user.isPremium) {
    const now = new Date();
    const lastReset = new Date(user.lastSwipeReset);
    const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

    if (hoursSinceReset >= 24) {
      user.swipeCount = 0;
      user.lastSwipeReset = now;
    }

    if (user.swipeCount >= 10) {
      return res.status(403).json({ error: 'Daily swipe limit reached. Upgrade to Premium for unlimited swipes!' });
    }
  }

  if (!['like', 'dislike', 'super_like'].includes(type)) {
    return res.status(400).json({ error: 'Invalid swipe type' });
  }

  try {
    const existingSwipe = await Interaction.findOne({
      where: { userId: user.id, targetId }
    });

    if (existingSwipe) {
      return res.status(400).json({ error: 'Already swiped on this user' });
    }

    await Interaction.create({ userId: user.id, targetId, type });
    
    // Increment swipe count for free users
    if (!user.isPremium) {
      await user.increment('swipeCount');
    }

    const targetUser = await User.findByPk(targetId);
    if (type === 'like' || type === 'super_like') {
      sendPushNotification(targetUser.fcmToken, 'New Like! ❤️', `${user.name} just liked your profile.`);

      const mutualLike = await Interaction.findOne({
        where: { 
          userId: targetId, 
          targetId: user.id, 
          type: { [Op.or]: ['like', 'super_like'] } 
        }
      });

      if (mutualLike) {
        const newMatch = await Match.create();
        await newMatch.addUsers([user.id, targetId]);
        sendPushNotification(targetUser.fcmToken, 'New Match! 🔥', `You matched with ${user.name}!`);
        sendPushNotification(user.fcmToken, 'New Match! 🔥', `You matched with ${targetUser.name}!`);
        return res.json({ match: true, matchId: newMatch.id, target: targetUser });
      }
    }

    res.json({ match: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing swipe' });
  }
});

router.post('/verify-profile', auth, async (req, res) => {
  const { verificationImage } = req.body;
  try {
    await req.user.update({ verificationImage });
    res.json({ success: true, message: 'Verification request submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Error submitting verification' });
  }
});

router.post('/approve-verification/:userId', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.update({ isVerified: true });
    sendPushNotification(user.fcmToken, 'Profile Verified! ✅', 'Your profile has been successfully verified.');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error approving verification' });
  }
});

router.post('/block', auth, async (req, res) => {
  const { blockedId } = req.body;
  try {
    await BlockedUser.create({ userId: req.user.id, blockedId });
    // Also remove match if exists
    const matches = await Match.findAll({
      include: [{ model: User, where: { id: [req.user.id, blockedId] } }]
    });
    // Complex match deletion logic simplified:
    for (const match of matches) {
      const users = await match.getUsers();
      const userIds = users.map(u => u.id);
      if (userIds.includes(req.user.id) && userIds.includes(blockedId)) {
        await match.destroy();
      }
    }
    res.json({ success: true, message: 'User blocked' });
  } catch (err) {
    res.status(500).json({ error: 'Error blocking user' });
  }
});

router.post('/report', auth, async (req, res) => {
  const { reportedId, reason, details } = req.body;
  try {
    await Report.create({ reporterId: req.user.id, reportedId, reason, details });
    res.json({ success: true, message: 'Report submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Error submitting report' });
  }
});

router.get('/who-liked-me', auth, checkPremium, async (req, res) => {
  try {
    const userWithLikes = await User.findByPk(req.user.id, {
      include: [{
        model: Interaction,
        as: 'receivedInteractions',
        where: { type: { [Op.or]: ['like', 'super_like'] } },
        include: [{
          model: User,
          attributes: ['id', 'name', 'age', 'bio', 'images']
        }]
      }]
    });

    if (!userWithLikes || !userWithLikes.receivedInteractions) {
      return res.json([]);
    }

    res.json(userWithLikes.receivedInteractions.map(i => i.User));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching likes' });
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
          attributes: ['id', 'name', 'age', 'bio', 'images', 'isVerified']
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
