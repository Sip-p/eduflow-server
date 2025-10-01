import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticateToken=async(req,res,next)=>{
try {
   const authHeader=req.headers["authorization"];
   const token=authHeader && authHeader.split(" ")[1]
   if(!token){
    return res.status(401).json({
        success:false,
        message:"Access token required"
    })
   }

   const decoded=jwt.verify(token,process.env.JWT_SECRET)
   const user=await User.findById(decoded.id).select('-password');
   if(!user){
    return reducer.status(401).json({
        success:false,
        message:"Invalid token-user not found"
    })
   }
   req.user=user
   next()
} catch (error) {
        console.error("Auth middleware error:", error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error during authentication"
        });
    }
};
