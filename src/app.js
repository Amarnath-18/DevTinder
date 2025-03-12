const connectDB = require('./config/dataBase');
const User = require('./Models/user'); // ✅ Correct import
const express = require("express");

const app = express();


app.use(express.json());

// ✅ SignUp Route
app.post('/signUp', async (req, res) => {
    const user =new User(req.body);
    try {
        await user.save(); // ✅ Save user to database

        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    console.log(req.body);
    res.send("User created successfully");
    
});


app.get('/feed' , async (req, res) => {
    const userEmail = req.body.email;

    try{
        const user = await User.find({email: userEmail});
        res.send(user);
    }catch(err){
        res.status(400).send("User not found");
    }
})


app.delete('/user' , async (req, res) => {
    const userId = req.body.userId;
    try{
        const user = await User.findByIdAndDelete(userId);
        if(!user){
            return res.status(404).send("User not found");
        }
        res.send(user);
    }catch{
        res.status(500).send("Server Error");
    }
})

// app.patch('/userUpdate' , async (req , res)=>{
//     const userId = req.body.userId;
//     const updatedUser = req.body;
    
    

//     try{
//         await User.findByIdAndUpdate(userId , updatedUser);
//         res.send("updated");
//     }catch(err){
//         res.status(404).send("Server Error");
//     }
// })
app.patch('/userUpdate', async (req, res) => {
    const { userId, ...updatedUser } = req.body; // Extract userId separately

    try {
        const user = await User.findByIdAndUpdate(userId, updatedUser, { new: true });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.send({ message: "User updated successfully", user });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});



// ✅ Connect to MongoDB and Start Server

connectDB()
    .then(() => {
        console.log('MongoDB Connected...');
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => {
        console.error(err.message);
    });
