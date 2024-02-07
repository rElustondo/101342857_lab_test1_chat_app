const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

app.get('/room/:room', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'room.html'));
  });
  

module.exports = app