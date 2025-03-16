const connectDB = require("./config/dataBase");
const express = require("express");
const cookieParser = require("cookie-parser");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const { userAuth } = require("./middlewares/userAuth");
const userAuthRouter = require("./routes/userAuth");
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userAuthRouter);
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
