const userModel = require('../models/user.model')
// const jwt = require("jsonwebtoken");

// async function authMiddleware(req,res,next){
//     const token = req.cookies.token;

//     if(!token){
//         return res.status(401).json({
//             message:"Unauthorized"
//         })
//     }
//     try{
//         const decoded = jwt.verify(token,process.env.JWT_SECRET);
//         const user = decoded;

//         req.user = user; // req.user mei ab user ki info aa jaegi jo bhi token mei thi
//         next();
//     }
//     catch(err){
//         return res.status(401).json({
//             message:"Unauthorized"
//         })
//     }
// }


// module.exports = {
//     authMiddleware
// }


const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
    // Priority 1: Check Cookies
    // Priority 2: Check Authorization Header (Bearer token)
    const authHeader = req.headers.authorization;
    const token = req.cookies?.token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized: No token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // decoded mein wahi info hogi jo tune login ke waqt sign kari thi (id, role, email)
        req.user = decoded; 
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(401).json({
            message: "Unauthorized: Invalid or Expired Token"
        });
    }
}

module.exports = { authMiddleware };