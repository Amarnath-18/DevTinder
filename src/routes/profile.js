const express = require("express");
const User = require("../Models/user");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const userAuth = require("../middlewares/userAuth");
const connectionRequests = require("../Models/connectionRequests");

profileRouter.patch("/userUpdate/:userId", async (req, res) => {
  const updatedUser = req.body;
  const userId = req.params.userId;

  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "skills", "gender", "age"];
    const updates = Object.keys(updatedUser);

    // Check if all provided updates are allowed
    const isValidUpdate = updates.every((update) =>
      ALLOWED_UPDATES.includes(update)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ error: "Invalid update field(s)" });
    }

    // Find user and update with validation
    const user = await User.findByIdAndUpdate(userId, updatedUser, {
      new: true, // Return updated document
      runValidators: true, // Enforce schema validations
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

profileRouter.get("/profile", userAuth, (req, res) => {
  try {
    console.log("User from request:", req.user); // Debugging

    if (!req.user) {
      return res.status(401).send("Unauthorized: No user data");
    }
    res.send(req.user);
  } catch (err) {
    res.status(404).send("User Not valid : " + err.message);
  }
});

profileRouter.patch("/passwordUpdate", userAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "New password required" });
    }
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    req.user.password = encryptedPassword;
    await req.user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(404).send("User Not valid : " + err.message);
  }
});

profileRouter.patch("/forgotPassword", async (req, res) => {
  try {
    const { password, email, name } = req.body;
    if (!password) {
      return res.status(400).json({ message: "New password required" });
    }
 
    const user = await User.findOne({
      $and: [
        { name: name },
        { email: email },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or name" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    user.password = encryptedPassword;
    await user.save(); 

    return res.json({ message: "Password updated successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

profileRouter.delete("/deleteConnection" , userAuth , async (req, res) => {
  const userId = req.user._id;
  
  try {
    const connection = await connectionRequests.findOneAndDelete({
      $or: [
        { fromUserId: userId, toUserId: req.body.connectionId },
        { fromUserId: req.body.connectionId, toUserId: userId },
      ],
    });
    
  } catch (error) {
    
  }
})

module.exports = profileRouter;