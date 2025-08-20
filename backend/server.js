const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { setupSocket } = require("./socket");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// REST APIs
app.use("/auth", authRoutes); // POST /auth/register, POST /auth/login
app.use("/users", userRoutes); // GET /users
app.use("/conversations", messageRoutes); // GET /conversations/:id/messages

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

// Socket.IO setup
setupSocket(server);
