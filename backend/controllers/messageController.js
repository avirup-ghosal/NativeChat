const Message = require("../models/Message");

// GET /conversations/:id/messages
const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const messages = await Message.find({
      $or: [
        { sender: conversationId },
        { receiver: conversationId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMessages };
