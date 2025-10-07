 import Review from "../models/Review.js"
 import jwt from 'jsonwebtoken'
 import User from "../models/User.js"
 export const addAppReview=async(req,res)=>{
    try {
        const {rating,comment}=req.body
        const autorization=req.headers["authorization"]
const token=autorization.split(" ")[1]
const decoded=jwt.verify(token,process.env.JWT_SECRET)
console.log(decoded.id)
const user=await User.findById(decoded.id)
        console.log("---------",user)
        if(!rating) return res.status(400).json({success:false,message:"Rating required"})
            const newreview=new Review({
        user:{
            _id:user.id,
            name:user.name,
            pic:user.pic
        }
    ,
rating,comment})
await newreview.save()
res.status(201).json({success:true,newreview})
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const getReviews=async(req,res)=>{
    try {
const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json({success:true,reviews})
    } catch (error) {
      console.error(error);
    res.status(500).json({ success: false, message: "Server error" });  
    }
}