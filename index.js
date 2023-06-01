// const dotenv = require("dotenv");
// const app = require('express');
// const server = require('http').createServer(app);
// dotenv.config();
// const io = require("socket.io")(server)
// const port = process.env.PORT || 8080;
// let activeUsers = [];
// app.get('/', function(req, res) {
//   res.sendfile('index.html');
// });
// io.on("connection", (socket) => {
//   //add new user
//   console.log('active users are', activeUsers)
//   socket.on("new-user", (newUserId) => {
//     if (!activeUsers.some((user) => user.userId === newUserId)) {
//       activeUsers.push({
//         userId: newUserId,
//         socketId: socket.id,
//       });
//     }
//     io.emit("get-users", activeUsers);
//   });

//   //send message
//   socket.on("send-message", (data) => {
//     let { receiverId } = data;
//     console.log('messages', data)
//     let user = activeUsers.find((user) => user.userId === receiverId);
//     if (user) {
//       io.to(user.socketId).emit("receive-message", data);
//       io.to(user.socketId).emit("receive-notification", {
//         senderId:data.senderId, receiverId:data.receiverId
//       });
//     }
//   });

//   socket.on('typing', (data) =>{
//     let { receiverId } = data;
//     let user = activeUsers.find((user) => user.userId === receiverId);
//     if (user) {
//       io.to(user.socketId).emit("userTyping", data);
//     }
//   })

//   socket.on("disconnect", () => {
//     activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
//     io.emit("get-users", activeUsers);
//   });
// });
// server.listen(port, function() {
//   console.log(`Listening on port ${port}`);
// });

const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require("dotenv");
const http = require('http')
const {Server} = require('socket.io');
app.use(cors());
dotenv.config();
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})



const port = process.env.PORT || 8080;
let activeUsers = [];

io.on("connection", (socket) => {
  //add new user
  console.log('active users are', socket.id)
  socket.on("new-user", (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id,
      });
    }
    io.emit("get-users", activeUsers);
  });

  //send message
  socket.on("send-message", (data) => {
    let { receiverId } = data;
    console.log('messages', data)
    let user = activeUsers.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("receive-message", data);
      io.to(user.socketId).emit("receive-notification", {
        senderId:data.senderId, receiverId:data.receiverId
      });
    }
  });

  socket.on('typing', (data) =>{
    let { receiverId } = data;
    let user = activeUsers.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("userTyping", data);
    }
  })

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    io.emit("get-users", activeUsers);
  });
});

server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});