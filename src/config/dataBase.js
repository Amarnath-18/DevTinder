const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://amarnathgarai2004:8UkRKGi4T5YjKZGU@cluster0.ai6ao.mongodb.net/DevTinder', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1); // Stop the app if DB connection fails
    }
};

module.exports = connectDB;
