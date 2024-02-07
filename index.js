const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/UserRoutes');
const chatRouter = require('./routes/ChatRoutes');
const roomRouter = require('./routes/RoomRoutes');

const app = express();
app.use(userRouter);
app.use(chatRouter)
app.use(roomRouter)

const connectionString = "mongodb+srv://rodrigo:YHzLdkuvhwHQ8ZUZ@cluster0.bbqnvc3.mongodb.net/w2024_comp3133?retryWrites=true&w=majority"

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(success => {
    console.log('Success Mongodb connection') 
  }).catch(err => {
    console.log('Error Mongodb connection')
  });
  const server = app.listen(3000, () => { console.log('Server is running...')});
  const ioServer = require('socket.io')(server);

  ioServer.on('connection', (socket) => {
    console.log('A user connected');
  
    socket.on('joinRoom', async ({ room }) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);

        // Retrieve messages for the joined room from MongoDB
        try {
            const messages = await Message.find({ room }).sort({ createdAt: 1 });
            socket.emit('messages', messages); // Send messages to the client
        } catch (error) {
            console.error('Error retrieving messages:', error);
        }
    });

    socket.on('leaveRoom', ({ room }) => {
        socket.leave(room);
        console.log(`User left room: ${room}`);
    });

    socket.on('sendMessage', async ({ username, message, room }) => {
        // Save the message to MongoDB
        try {
            const newMessage = new Message({ username, message, room });
            await newMessage.save();
        } catch (error) {
            console.error('Error saving message:', error);
        }

        // Broadcast the message to all users in the same room
        io.to(room).emit('message', { username, message });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
  });