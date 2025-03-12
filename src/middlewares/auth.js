const auth = (req , res , next)=>{
    var token = "token123";
    if(token === "token123"){
        console.log('Access granted');
        next();
    }
    else{
        console.log('Access denied');
        res.status(401).send('Unauthorized');
    }
}

const adminAuth = (req , res , next)=>{
    var token = "adminToken123";
    if(token === "adminToken123"){
        console.log('Admin access granted');
        next();
    }
    else{
        console.log('Admin access denied');
        res.status(401).send('Unauthorized');
    }
}

module.exports = {
    auth: auth,
    adminAuth: adminAuth
};