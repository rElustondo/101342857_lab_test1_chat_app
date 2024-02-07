const express = require('express');
const app = express();
const path = require('path');
const User = require('../models/Users');

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

app.post('/signup', async (req, res) => {
  try {
    const userData = req.body;
    const newUser = new User(userData);
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'Congratulation, the user was created successfully! Please proceed to logging in.', user: savedUser });
  } catch (error) {
    console.error('There was an error creating user:', error);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      res.status(200).json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'This user was not found or you entered incorrect password' });
    }
  } catch (error) {
    console.error('There was an error logging you in:', error);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
  }
});



module.exports = app