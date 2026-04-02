const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Interaction = sequelize.define('Interaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  targetId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('like', 'dislike'), allowNull: false },
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
});

// Associations
User.hasMany(Interaction, { foreignKey: 'userId' });
Interaction.belongsTo(User, { foreignKey: 'userId' });

Match.belongsToMany(User, { through: 'UserMatches' });
User.belongsToMany(Match, { through: 'UserMatches' });

Match.hasMany(Message, { foreignKey: 'matchId' });
Message.belongsTo(Match, { foreignKey: 'matchId' });

module.exports = { Interaction, Match, Message };
