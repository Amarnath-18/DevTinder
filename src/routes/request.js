const express = require("express");
const requestRouter = express.Router();
const User = require('../Models/user');
requestRouter.get("/feed", async (req, res) => {
  const userEmail = req.body.email;
  try {
    const user = await User.find({ email: userEmail });
    res.send(user);
  } catch (err) {
    res.status(400).send("User not found");
  }

});

module.exports = requestRouter;