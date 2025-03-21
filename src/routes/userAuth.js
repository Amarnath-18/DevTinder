const express = require("express");
const User = require("../Models/user");
const { ValidateSignUp } = require("../utils/validateUser");
const bcrypt = require("bcrypt");
const userAuth = require("../middlewares/userAuth");
const connectionRequests = require("../Models/connectionRequests");
const userAuthRouter = express.Router();


const  USER_SAFE_DATA = "name lastName skills gender photoUrl"

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

userAuthRouter.get("/received", userAuth, async (req, res) => {
  const userId = req.user._id;
  try {
    const receivedRequests = await connectionRequests
      .find({
        toUserId: userId,
        status: "interested",
      })
      .populate("fromUserId", ["name", "lastName"]);
    res.json(receivedRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

userAuthRouter.get("/connections", userAuth, async (req, res) => {
  const userId = req.user._id.toString(); // Ensure userId is a string
  try {
    const connections = await connectionRequests.find({
      $or: [
        { fromUserId: userId, status: "accepted" },
        { toUserId: userId, status: "accepted" },
      ],
    }).populate("fromUserId" , USER_SAFE_DATA).populate("toUserId" , USER_SAFE_DATA); // Ensure we get full user objects

    const data = connections.map((e) => {
      const fromUser = e.fromUserId._id?.toString() || e.fromUserId; // Handle both object and string cases
      return fromUser === userId ? e.toUserId : e.fromUserId;
    });

    res.json({message : "All connections are here" , data});
  } catch (err) {
    res.status(400).json({ error: "Some error occurred in request connections", details: err.message });
  }
});

module.exports = userAuthRouter;
