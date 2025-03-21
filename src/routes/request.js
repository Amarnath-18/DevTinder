const express = require("express");
const requestRouter = express.Router();
const User = require("../Models/user");
const userAuth = require("../middlewares/userAuth");
const connectionRequest = require("../Models/connectionRequests");

const  USER_SAFE_DATA = "name lastName skills gender photoUrl"


requestRouter.get("/feed",userAuth, async (req, res) => {
  const LoggedInUser = req.user;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const skip = (page-1) * limit;

  

  try {
    const connectionRequests = await connectionRequest.find({
      $or:[{
        fromUserId : LoggedInUser._id,
      },
      {
        toUserId : LoggedInUser._id
      }]
    }).select("fromUserId toUserId");    

    const HiddenUserFromFeed = new Set();
    console.log(connectionRequests);

    connectionRequests.forEach((req)=>{
      HiddenUserFromFeed.add(req.fromUserId.toString());
      HiddenUserFromFeed.add(req.toUserId.toString());   
    })

    const FeedConnections = await User.find({
      $and :[
        {_id: {$nin : Array.from(HiddenUserFromFeed)}},
        { _id : {$ne : LoggedInUser._id}}
      ],
    }).select(USER_SAFE_DATA).skip(skip).limit(limit)
    
    res.send(FeedConnections);

  }catch (err) {
    console.error("Error in /feed route:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }  
});

requestRouter.post(
  "/send/:status/:userId",
  userAuth,
  async (req, res) => {
    const fromUserId = req.user._id;
    const toUserId = req.params.userId;
    let status = req.params.status;
    try {
      // validate toUserId
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).send("User not found");
      }

      // validate fromUserId
      const fromUser = await User.findById(fromUserId);
      if (!fromUser) {
        return res.status(404).send("User not found");
      }
      // validate status
      if (!status) {
        return res.status(400).send("Status is required");
      }

      // Validate fromUser and toUser are not the same user
      if (fromUserId.toString() === toUserId.toString()) {
        return res
          .status(400)
          .json({ error: "You cannot send a request to yourself" });
      }
      // Ensure status is a valid string from allowed values
      const allowedStatuses = ["ignored", "interested"];

      if (!allowedStatuses.includes(status)) {
        return res
          .status(400)
          .json({ error: `${status} is an invalid status type` });
      }
      // Check if user already has a pending request
      const existingRequest = await connectionRequest.findOne({
        $or: [
          { fromUserId: fromUserId, toUserId: toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingRequest) {
        return res
          .status(400)
          .json({ error: "You already have a pending request" });
      }

      const newConnectionRequest = new connectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      await newConnectionRequest.save();
      res.json(newConnectionRequest);
    } catch (err) {
      console.error(err); // Log the actual error
      res
        .status(400)
        .json({ error: "Failed to send request", details: err.message });
    }
  }
);

requestRouter.post(
  "/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    const userId = req.user._id;
    const requestId = req.params.requestId;

    try {
      const request = await connectionRequest.findOne({
        _id: requestId,
        status: "interested",
        toUserId: userId,
      });

      if (!request) {
        console.log(requestId);
        return res
          .status(404)
          .json({ error: "Request not found or already processed" });
      }

      // Validate status
      const status = req.params.status;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({
            error:
              "Invalid status type. Allowed values: 'accepted' or 'rejected'",
          });
      }

      // Update request status
      request.status = status;
      const data = await request.save();

      res.json({ message: `Request ${status}`, details: data });
    } catch (err) {
      console.error(err); // Log the error for debugging
      res
        .status(500)
        .json({ error: "Failed to review request", details: err.message });
    }
  }
);

module.exports = requestRouter;
