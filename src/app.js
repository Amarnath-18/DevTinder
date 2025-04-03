const connectDB = require("./config/dataBase");
const express = require("express");
const cookieParser = require("cookie-parser");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userAuthRouter = require("./routes/userAuth");
const ChatRouter = require('./routes/Chats')
const cors = require("cors");
const app = express();


// CORS Configuration

const options = {
  origin: "http://localhost:5173",
  credentials: true,
};


app.use(cors(options))
app.use(express.json());
app.use(cookieParser());

app.use('/', profileRouter);
app.use('/request', requestRouter);
app.use('/user', userAuthRouter);
app.use('/' , ChatRouter)
// ✅ Connect to MongoDB and Start Server
app.get("/" , (req , res , next) => {
  console.log("hello");
  res.send("Running");
  next();
});
const http = require("http");
const initializeSocket = require("./utils/socket");
const server = http.createServer(app);
initializeSocket(server);


connectDB()
  .then(() => {
    console.log("MongoDB Connected...");
    server.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error(err.message);
  });
