const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Interaction = sequelize.define('Interaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  targetId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('like', 'dislike', 'super_like'), allowNull: false },
});

const Match = sequelize.define('Match', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
});

const Message = sequelize.define('Message', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  matchId: { type: DataTypes.UUID, allowNull: false },
  senderId: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  type: { 
    type: DataTypes.ENUM('text', 'image', 'voice'), 
    defaultValue: 'text' 
  },
  status: { 
    type: DataTypes.ENUM('sent', 'delivered', 'seen'), 
    defaultValue: 'sent' 
  },
});

const BlockedUser = sequelize.define('BlockedUser', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  blockedId: { type: DataTypes.UUID, allowNull: false },
});

const Report = sequelize.define('Report', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reporterId: { type: DataTypes.UUID, allowNull: false },
  reportedId: { type: DataTypes.UUID, allowNull: false },
  reason: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'resolved'), defaultValue: 'pending' },
});

// Associations
User.hasMany(Interaction, { foreignKey: 'userId' });
Interaction.belongsTo(User, { foreignKey: 'userId' });
Interaction.belongsTo(User, { foreignKey: 'targetId', as: 'targetUser' });
User.hasMany(Interaction, { foreignKey: 'targetId', as: 'receivedInteractions' });

Match.belongsToMany(User, { through: 'UserMatches' });
User.belongsToMany(Match, { through: 'UserMatches' });

Match.hasMany(Message, { foreignKey: 'matchId' });
Message.belongsTo(Match, { foreignKey: 'matchId' });

User.hasMany(BlockedUser, { foreignKey: 'userId' });
BlockedUser.belongsTo(User, { foreignKey: 'userId', as: 'user' });
BlockedUser.belongsTo(User, { foreignKey: 'blockedId', as: 'blocked' });

User.hasMany(Report, { foreignKey: 'reporterId' });
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'reportedId', as: 'reported' });

module.exports = { Interaction, Match, Message, BlockedUser, Report };
