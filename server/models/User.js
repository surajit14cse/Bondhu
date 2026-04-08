const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true, unique: true },
  phone: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER },
  gender: { type: DataTypes.STRING },
  bio: { type: DataTypes.TEXT },
  images: { 
    type: DataTypes.JSON, 
    defaultValue: [] 
  },
  interests: { 
    type: DataTypes.JSON, 
    defaultValue: [] 
  },
  latitude: { type: DataTypes.FLOAT },
  longitude: { type: DataTypes.FLOAT },
  lastActive: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  fcmToken: { type: DataTypes.STRING },
  isPremium: { type: DataTypes.BOOLEAN, defaultValue: false },
  premiumExpiry: { type: DataTypes.DATE },
  swipeCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastSwipeReset: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  boostExpiry: { type: DataTypes.DATE },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationImage: { type: DataTypes.STRING },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;
