const userModel = require('../models/user.model')
const jwt = require("jsonwebtoken");

async function authMiddleware(req,res,next){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = decoded;

        req.user = user; // req.user mei ab user ki info aa jaegi jo bhi token mei thi
        next();
    }
    catch(err){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }
}


module.exports = {
    authMiddleware
}
