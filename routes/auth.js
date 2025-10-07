const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUsers = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUsers.rows.length > 0) {
      return res.status(400).json({ message: 'User already registered with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, email, phone, hashedPassword, 'customer']
    );

    res.status(201).json({ 
      message: 'Registration successful',
      userId: result.rows[0].id 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (role === 'admin') {
      if (username === 'admin@123' && password === 'admin@1212') {
        const token = jwt.sign(
          { id: 0, role: 'admin', name: 'Admin' },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          message: 'Welcome Admin!',
          token,
          user: { id: 0, name: 'Admin', role: 'admin' }
        });
      } else {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
    }

    const users = await db.query(
      'SELECT * FROM users WHERE email = $1 OR name = $1',
      [username]
    );

    if (users.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = users.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: `Welcome ${user.name}`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
