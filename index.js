const io = require("socket.io")(8000, {
  cors: {
    origin: "*",
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  //add new user
  console.log('active users are', activeUsers)
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
