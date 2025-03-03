const express = require("express");

const server = express(); 

server.use("/tet",(req, res) => {
    res.send("Hello from the server")
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
