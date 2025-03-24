const express = require("express");
const User = require("../Models/user");
const { ValidateSignUp } = require("../utils/validateUser");
const bcrypt = require("bcrypt");
const userAuth = require("../middlewares/userAuth");
const connectionRequests = require("../Models/connectionRequests");
const userAuthRouter = express.Router();


const  USER_SAFE_DATA = "name lastName skills gender photoUrl about "

userAuthRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "Invalid username" });
    }
    const isMatch = user.validatePassword(password);
    if (!isMatch) {
      return res.status(404).json({ message: "Invalid password" });
    }
    const token = user.getJWT();

    res.cookie("authToken", token, { httpOnly: true, secure: true });
    res.json(user);
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

    res.status(201).json({user: user});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

userAuthRouter.post("/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: true,  // ❗ Set to `false` for local development (if not using HTTPS)
    sameSite: "none",  // ❗ Set to "lax" if frontend and backend are on the same origin
  });
  
  res.status(200).json({ message: "Logged out successfully" });
});


userAuthRouter.get("/received", userAuth, async (req, res) => {
  const userId = req.user._id;
  try {
    const receivedRequests = await connectionRequests
      .find({
        toUserId: userId,
        status: "interested",
      })
      .populate("fromUserId");
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
    }).populate("fromUserId").populate("toUserId"); // Ensure we get full user objects

    const data = connections.map((e) => {
      const fromUser = e.fromUserId._id?.toString() || e.fromUserId; // Handle both object and string cases
      return fromUser === userId ? e.toUserId : e.fromUserId;
    });

    res.json({message : "All connections are here" , data});
  } catch (err) {
    res.status(400).json({ error: "Some error occurred in request connections", details: err.message });
  }
});


userAuthRouter.delete("/delete", userAuth ,  async (req, res) => {
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

userAuthRouter.delete("/deleteConnection" , userAuth , async (req, res) => {
  const { _id } = req.body;
  const userId2 = _id;
  const userId = req.user._id;
  if (!userId || !userId2) {
    console.log("User 1" , userId , "User 2" , userId2);
    
    return res.status(400).json({ error: "Both userId1 and userId2 are required" });
  }
  try {
    const connection = await connectionRequests.findOneAndDelete( 
      {
        $or: [
          { fromUserId: userId, toUserId: userId2 , status : "accepted" },
          { fromUserId: userId2, toUserId: userId , status : "accepted" },
        ]
      }
    )
    if (!connection) {
      return res.status(404).send("Connection not found");
    }
    res.send(connection);
    
  } catch (error) {
    res.status(400).json({ error: "Some error occurred in request connections", details: error.message });
  }
})

module.exports = userAuthRouter;
