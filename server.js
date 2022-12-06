
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser,userLeave, getRoomUsers }= require('./utils/users');

const app = express();
const server = http.createServer(app);
const io= socketio(server);

// Set Static folder 
app.use(express.static(path.join(__dirname,'public')));

const botName = 'ChatCord Bot';

//  Run when a client connects
io.on('connection', socket => {
   socket.on('joinRoom', ({username, room})=>{
    const user = userJoin(socket.id,username, room);

    socket.join(user.room);

// it emit message to single user
    // welcome current user
    socket.emit('message', formatMessage(botName,' welcome to chatcord'));

    //  Broadcast when a user connects broadcast show/emit message to all user except that user 
    socket.broadcast
    .to(user.room)
    .emit('message', 
    formatMessage(botName,`${user.username} joined the chat`));
 

    //   send user and room info in side bar
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    // io.emit()  it will emit message to all users everyboy
 });

    //    Listen for chatMessage 
    socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

      io.to(user.room).emit('message',formatMessage(user.username, msg));
    });
     //  Run when client Disconnect
     socket.on('disconnect', ()=>{
         const user = userLeave(socket.id);
       
         if(user){
            io.to(user.room).emit(
                'message',
                 formatMessage(botName,` ${user.username} has Left the chat`), 
                 );
//   send user and room info in side bar when disconnect
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });

         }
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(` server is running on port ${PORT}`));