const mongoose = require('mongoose')
const connectionRequest = new mongoose.Schema(
    {
        fromUserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref : "User",
            required:true
        },
        toUserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ["ignored", "interested", "accepted", "rejected"], // Correct key name is 'values'
                message: "{VALUE} is an incorrect status type" // Correct spelling of 'message'
            }
        }
        
    },{
        timestamps:true
    }
);

module.exports = new mongoose.model('ConnectionRequest', connectionRequest);