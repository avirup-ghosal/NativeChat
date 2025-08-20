const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http"); // for socket.io
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const initSocket = require("./socket"); // custom socket logic

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // create http server for socket.io

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});
initSocket(io);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
