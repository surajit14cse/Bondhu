const sequelize = require('./config/database');
const User = require('./models/User');
const { Interaction } = require('./models/Chat');
const bcrypt = require('bcryptjs');

const dummyUsers = [
  { name: 'Sumiya Khan', email: 'sumiya@example.com', password: 'password123', age: 22, gender: 'female', bio: 'Love traveling and photography!', interests: ['Travel', 'Photography', 'Music'] },
  { name: 'Arif Ahmed', email: 'arif@example.com', password: 'password123', age: 25, gender: 'male', bio: 'Tech enthusiast and gamer.', interests: ['Gaming', 'Coding', 'Movies'] },
  { name: 'Nusrat Jahan', email: 'nusrat@example.com', password: 'password123', age: 21, gender: 'female', bio: 'Foodie and movie lover.', interests: ['Cooking', 'Movies', 'Dancing'] },
  { name: 'Rakib Hasan', email: 'rakib@example.com', password: 'password123', age: 24, gender: 'male', bio: 'Fitness freak and gym lover.', interests: ['Fitness', 'Gym', 'Sports'] },
  { name: 'Tania Akter', email: 'tania@example.com', password: 'password123', age: 23, gender: 'female', bio: 'Artist and creative soul.', interests: ['Art', 'Design', 'Reading'] },
  { name: 'Fahim Morshed', email: 'fahim@example.com', password: 'password123', age: 26, gender: 'male', bio: 'Entrepreneur and traveler.', interests: ['Business', 'Travel', 'Networking'] },
  { name: 'Sadia Islam', email: 'sadia@example.com', password: 'password123', age: 20, gender: 'female', bio: 'Student and bookworm.', interests: ['Reading', 'Writing', 'History'] },
  { name: 'Mehedi Hasan', email: 'mehedi@example.com', password: 'password123', age: 27, gender: 'male', bio: 'Music is my life.', interests: ['Music', 'Guitar', 'Singing'] },
  { name: 'Mim Akter', email: 'mim@example.com', password: 'password123', age: 22, gender: 'female', bio: 'Nature lover and hiker.', interests: ['Nature', 'Hiking', 'Animals'] },
  { name: 'Sabbir Ahmed', email: 'sabbir@example.com', password: 'password123', age: 23, gender: 'male', bio: 'Coffee and code.', interests: ['Coffee', 'Coding', 'Chess'] },
];

const seed = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database synced');

    for (const u of dummyUsers) {
      const existing = await User.findOne({ where: { email: u.email } });
      if (!existing) {
        // Hash password manually because beforeCreate might not work with bulkCreate or similar
        // but here we use create()
        await User.create(u);
        console.log(`Created user: ${u.name}`);
      }
    }
    console.log('Seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
