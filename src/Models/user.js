const mongoose = require('mongoose');
const validator = require('validator');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        
    },
    lastName: {
        type: String,
        minlength: 3,
        maxlength: 50,
        validate(value){
            if (!validator.isAlpha(value)) {
                throw new Error('Last name should only contain alphabetic characters');
            }
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email' + value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
        validate(value) {
            if (!['male', 'female', 'other'].includes(value.toLowerCase())) { 
                throw new Error('Gender should be male, female, or other');
            }
        }
    },
    photoUrl:{
        type: String,
        default: 'https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg', // ✅ Default placeholder image URL
        validate(value){
            if (!validator.isURL(value)) {
                throw new Error('Invalid photo URL' + value);
            }
        }
    },
    skills: {
        type: [String],
        default: [], // ✅ Default empty array
    },
    about: {
        type: String,
        maxlength: 200
    }
}, { timestamps: true }); // ✅ Correct placement of timestamps

module.exports = mongoose.model('User', userSchema);
