const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  console.log('Signup Request Body:', req.body);
  try {
    console.log(`Attempting signup for: ${email || phone}`);
    const user = await User.create({ name, email, phone, password });
    console.log(`User created successfully: ${user.id}`);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user.id, name, email, phone } });
  } catch (err) {
    console.error('Signup Error:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0].path;
      return res.status(400).json({ error: `An account with this ${field} already exists.` });
    }
    res.status(400).json({ error: 'Could not create account. Please ensure all fields are valid.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, phone, password } = req.body;
  try {
    const where = email ? { email } : { phone };
    const user = await User.findOne({ where });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
