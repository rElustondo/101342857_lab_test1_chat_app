const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/UserRoutes');
const chatRouter = require('./routes/ChatRoutes');
const Message = require('./models/Message')
const PORT = process.env.PORT || 3000;
const app = express();
app.use(userRouter);
app.use(chatRouter)

const connectionString = "mongodb+srv://rodrigo:YHzLdkuvhwHQ8ZUZ@cluster0.bbqnvc3.mongodb.net/w2024_comp3133?retryWrites=true&w=majority"

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(success => {
    console.log('Success Mongodb connection') 
  }).catch(err => {
    console.log('Error Mongodb connection')
  });
  const server = app.listen(PORT, () => { console.log('Server is running...')});
  const io = require('socket.io')(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', async ({ room }) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
        try {
            const messages = await Message.find({ room }).sort({ createdAt: 1 });
            socket.emit('messages', messages);
        } catch (error) {
            console.error('Error retrieving messages:', error);
        }
    });

    socket.on('leaveRoom', ({ room }) => {
        socket.leave(room);
        socket.emit('messages', []);
        console.log(`User left room: ${room}`);
    });

    socket.on('sendMessage', async ({username,message, room}) => {

        try {
            const newMessage = new Message({ username, message, room });
            await newMessage.save();
        } catch (error) {
            console.error('Error saving message:', error);
        }

        io.to(room).emit('message', { username, message });
        socket.broadcast.emit('userTyping', { username, typing:false });
    });
    socket.on('typing', ({ username, typing }) => {
        if(typing)socket.broadcast.emit('userTyping', { username, typing:true });
      });
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
  });

  module.exports = app