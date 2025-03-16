const express = require('express');
const User = require('../Models/user')
const { ValidateSignUp } = require('../utils/validateUser');
const bcrypt = require('bcrypt');
const userAuthRouter = express.Router();

userAuthRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User not found");
    }
    const isMatch = user.validatePassword(password);
    if (!isMatch) {
      throw new Error("Invalid password");
    }
    const token = user.getJWT();

    res.cookie("authToken", token, { httpOnly: true, secure: true });
    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

userAuthRouter.post("/signUp", async (req, res) => {
  try {
    const { name, email, lastName, password } = req.body;

    ValidateSignUp(req);

    const emcryptedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      lastName,
      email,
      password: emcryptedPassword,
    });
    await user.save(); // ✅ Save user to database

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


userAuthRouter.post("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.json({ message: "Logged out successfully" });
});

module.exports = userAuthRouter;