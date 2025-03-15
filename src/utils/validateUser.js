const Validator = require('validator')
const ValidateSignUp=(req)=>{
    const {name , lastName , email , password}= req.body;
    if(!name || !lastName){
        throw new Error("Invalid Name")
    }
    else if(!Validator.isEmail(email)){
        throw new Error("Invalid Email")
    }
    else if(!Validator.isStrongPassword(password)){
        throw new Error("Password is not strong  enough")
    }
}

module.exports = {
    ValidateSignUp,
}