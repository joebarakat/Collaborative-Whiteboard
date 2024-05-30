const express = require('express');
const http = require('http');
const { connections, connection } = require('mongoose');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const users = {};
const activeDrawingUsers = {};

io.on('connection', (socket) => {
  console.log('a new user connected');
  
  socket.on('new user', (username, callback) => {
    if (Object.values(users).includes(username)) {
      callback({ success: false, message: 'Username already taken. Please choose another one.' });
    } else {
      users[socket.id] = username;
      io.emit('user list', Object.values(users));
      callback({ success: true });
      console.log(users);
    }
  });

  socket.on('start drawing', () => {
    const username = users[socket.id];
    if (username) {
      activeDrawingUsers[socket.id] = true;
      io.emit('user drawing', { username, drawing: true });
      io.emit('user list', Object.values(users)); 
    }
  });

  socket.on('stop drawing', () => {
    const username = users[socket.id];
    if (username) {
      delete activeDrawingUsers[socket.id];
      io.emit('user drawing', { username, drawing: false });
      io.emit('user list', Object.values(users));
    }
  });

  socket.on('draw', (data) => {
    const username = users[socket.id];
    if (username && activeDrawingUsers[socket.id]) {
      socket.broadcast.emit('draw', data);
    }
  });

  socket.on('clear', () => {
    socket.broadcast.emit('clear');
  });

  socket.on('send message', (message) => {
    const username = users[socket.id];
    if (username) {
      const fullMessage = `${username}: ${message}`;
      io.emit('receive message', fullMessage);
    }
  });
  
  socket.on('load canvas', (dataURL) => {
    socket.broadcast.emit('load canvas', dataURL);
  });
  
  socket.on('update canvas', (dataURL) => {
    socket.broadcast.emit('update canvas', dataURL);
  });
  
  
  socket.on('disconnect', () => {
    delete users[socket.id];
    delete activeDrawingUsers[socket.id];
    io.emit('user list', Object.values(users));
    console.log('user disconnected');
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
