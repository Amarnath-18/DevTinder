const express = require("express");
const Chat = require("../Models/chatMessages");
const userAuth = require("../middlewares/userAuth");
const chatRouter = express.Router();

chatRouter.get("/chat/:id", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;
    const { id } = req.params;
    console.log(userId , id);
        
    const chat = await Chat.findOne({ participants: {$all:[userId , id] }}).populate(
      "messages.senderId",
      "name"
    );
    res.json(chat );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = chatRouter;