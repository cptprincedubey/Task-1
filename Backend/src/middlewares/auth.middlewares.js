const UserModel = require("../models/user.model")
const jwt = require("jsonwebtoken");
const cacheInstance = require("../services/cache.service");


const authMiddleware = async (req,res,next) =>{
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        let token = null;
        
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Remove "Bearer " prefix
        }
        
        // Fallback to cookie if header not found
        if (!token) {
            token = req.cookies.token;
        }
        
        if(!token){
            return res.status(401).json(
                {message:"Token not found"}
            )
        };
       //  let isBlacklisted = await cacheInstance.get(token)
       //  if(isBlacklisted)
       //     return res.status(400).json({
       // message:"Token is blacklisted"
       //  })
        let decode = jwt.verify(token,process.env.JWT_SECRET);
        let user = await UserModel.findById(decode.id);

        if(!user){
            return res.status(404).json(
                {message:"User not found"}
            )
        }
        req.user = user;
        next();
        
    } catch (error) {
        console.log(error);
        return res.status(401).json(
            {message:"Invalid or expired token",
               error:error,
            }
        )
    }
}

module.exports = authMiddleware