const UserModel = require("../models/user.model")
const jwt = require("jsonwebtoken");
const cacheInstance = require("../services/cache.service");


const authMiddleware = async (req,res,next) =>{
    try {
        let token = req.cookies.token;
        if(!token){
            return res.status(404).json(
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
        return res.status(500).json(
            {message:"Something went wrong",
               error:error,
            }
        )
    }
}

module.exports = authMiddleware