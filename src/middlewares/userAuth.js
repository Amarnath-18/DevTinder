const jwt = require("jsonwebtoken");
const User = require("../Models/user");
const userAuth = async (req, res, next) => {
  try {
    const { authToken } = req.cookies;
    if (!authToken) {
        console.log(authToken);
        
      throw new Error("invalid token");
    }
    const decodedObj = jwt.verify(authToken, "supersecret");
    const { _id } = decodedObj;

    const user = await User.findById(_id);

    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;    
    next();
  } catch (err) {
    res.status(404).send({
      message: err.message,
    });
  }
};

module.exports = {
  userAuth,
};
