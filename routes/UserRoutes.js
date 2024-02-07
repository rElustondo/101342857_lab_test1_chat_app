const express = require('express');
const app = express();
const path = require('path');
const User = require('../models/Users');

// Serve static files from the public folder
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

    // Create a new user instance
    const newUser = new User(userData);

    // Save the user to the database
    const savedUser = await newUser.save();

    // Send a success response
    res.status(201).json({ message: 'User created successfully', user: savedUser });
  } catch (error) {
    console.error('Error creating user:', error);
    // Send an error response
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Find user in the database by username and password
    const user = await User.findOne({ username, password });
    if (user) {
      // Send a success response with user data
      res.status(200).json({ success: true, user });
    } else {
      // Send a failure response if user not found
      res.status(404).json({ success: false, message: 'User not found or incorrect credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    // Send an error response
    res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
  }
});



module.exports = app