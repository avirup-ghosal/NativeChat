const express = require("express");
const router = express.Router();
const { getMessages } = require("../controllers/messageController");

// GET /conversations/:id/messages
router.get("/:id/messages", getMessages);

module.exports = router;
