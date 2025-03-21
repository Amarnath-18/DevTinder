const express = require("express");
const User = require("../Models/user");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const userAuth = require("../middlewares/userAuth");

profileRouter.patch("/userUpdate/:userId", async (req, res) => {
  const updatedUser = req.body;
  const userId = req.params.userId;

  try {
    const ALLOWED_UPDATES = [
      "userId",
      "photoUrl",
      "about",
      "skills",
      "gender",
      "age",
    ];
    const isValidUpdate = Object.keys(updatedUser).every((update) =>
      ALLOWED_UPDATES.includes(update)
    );

    if (!isValidUpdate) {
      throw new Error("Invalid update");
    }

    const user = await User.findByIdAndUpdate(userId, updatedUser, {
      runValidators: true,
      returnDocuments: "after",
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send({ message: "User updated successfully", user });
  } catch (err) {
    res.status(404).json({ error: err.message });
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


profileRouter.patch("/passwordUpdate" , userAuth ,async (req, res) => {
  try {
    // code to update password goes here
    const { newPassword } = req.body;
    if(!newPassword){
      throw new Error("New password required");
    };
    const emcryptedPassword = await bcrypt.hash(newPassword, 10);
    req.user.password = emcryptedPassword;
    await req.user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(404).send("User Not valid : " + err.message);
  }
})


module.exports = profileRouter;
