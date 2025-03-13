const connectDB = require("./config/dataBase");
const User = require("./Models/user"); // ✅ Correct import
const express = require("express");
const { ValidateSignUp } = require("./utils/validateUser");
const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email : email });
    if (!user) {
      throw new Error("User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid password");
    }
    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ SignUp Route
app.post("/signUp", async (req, res) => {
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

app.get("/feed", async (req, res) => {
  const userEmail = req.body.email;
  try {
    const user = await User.find({ email: userEmail });
    res.send(user);
  } catch (err) {
    res.status(400).send("User not found");
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch {
    res.status(500).send("Server Error");
  }
});

app.patch("/userUpdate/:userId", async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

// ✅ Connect to MongoDB and Start Server

connectDB()
  .then(() => {
    console.log("MongoDB Connected...");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error(err.message);
  });
