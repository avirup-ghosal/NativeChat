module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join user-specific room
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // Handle sending messages
    socket.on("sendMessage", (message) => {
      const { senderId, receiverId, text } = message;

      // Send to receiver
      io.to(receiverId).emit("receiveMessage", { senderId, text });

      // Optional: send back to sender
      io.to(senderId).emit("messageSent", { receiverId, text });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
