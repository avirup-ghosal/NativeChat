const { Server } = require("socket.io");
const Message = require("./models/Message");

let onlineUsers = {};

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected: ", socket.id);

    // Track online users
    socket.on("user:online", (userId) => {
      onlineUsers[userId] = socket.id;
    });

    // Handle sending a new message
    socket.on("message:send", async ({ sender, receiver, content }) => {
      try {
        const message = await Message.create({ sender, receiver, content });
        socket.to(onlineUsers[receiver]).emit("message:new", message);
      } catch (err) {
        console.error(err);
      }
    });

    // Typing indicator
    socket.on("typing:start", ({ sender, receiver }) => {
      socket.to(onlineUsers[receiver]).emit("typing:start", { sender });
    });

    socket.on("typing:stop", ({ sender, receiver }) => {
      socket.to(onlineUsers[receiver]).emit("typing:stop", { sender });
    });

    // Mark message as read
    socket.on("message:read", async ({ messageId }) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          { read: true },
          { new: true }
        );
        if (message && onlineUsers[message.sender]) {
          socket.to(onlineUsers[message.sender]).emit("message:read", message);
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconnect", () => {
      for (let userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) delete onlineUsers[userId];
      }
      console.log("Client disconnected: ", socket.id);
    });
  });
}

module.exports = { setupSocket };
