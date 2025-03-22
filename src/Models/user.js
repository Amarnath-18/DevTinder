const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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
        min: 18,
        max: 99,
        validate(value) {
            if (value < 18 || value > 99) {
                throw new Error('Age should be between 18 and 99');
            }
        }
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

userSchema.methods.getJWT = function (){
    const token = jwt.sign({ id: this._id }, 'supersecret', { expiresIn: '7d' });
    return token;
}
userSchema.methods.validatePassword = function(passwordByUser){
    return bcrypt.compareSync(passwordByUser, this.password); 
}

module.exports = mongoose.model('User', userSchema);
