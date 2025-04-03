const socket = require("socket.io");
const Chat = require("../Models/chatMessages");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  
  io.on("connection",  (socket) => {
    socket.on("joinChat", async ({ userId, id, firstName, lastName }) => {
      const room = [userId, id].sort().join("_");
      let chat = await Chat.findOne({participants : { $all:[userId , id]}});
      if(!chat){
        chat = new Chat({
          participants : [userId, id],
          messages : []
        });
        await chat.save();
      }
      socket.join(room);
      console.log(`${firstName} ${lastName} is in room ${room}`);
    });

    socket.on("sendMessage", async ({ userId, id, text }) => {
      const room = [userId, id].sort().join("_");
      await Chat.findOneAndUpdate(
        {participants : { $all:[userId , id] }},
        {$push: { messages: { senderId: userId, text } }},
      )
      io.to(room).emit("message", { userId, id, text, sender: userId });
      console.log(`📩 Message from ${socket.id} in ${room}: ${text}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${socket.id}`);
    });
  });
};

module.exports = initializeSocket;
