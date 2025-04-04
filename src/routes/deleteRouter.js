const express = require("express");
const deleteRouter = express.Router();
const User = require("../Models/user");
const userAuth = require("../middlewares/userAuth");

deleteRouter.delete("/user/delete", userAuth ,  async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch {
    res.status(400).send("Server Error");
  }
});

module.exports = deleteRouter;
