import express from'express'
 
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const PayperCourse = async (req, res) => {
  try {
    const { course } = req.body;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    // console.log("Authorization token:", token);
    // console.log("Requested course:", course);
   

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from token payload
    const user = await User.findById(decoded.id).select("-password");
    //   console.log("The USer",user)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if(!user.coursesenrolled.includes(course._id)){
        user.coursesenrolled.push(course._id);
        await user.save()
    }
    // If course exists, continue payment logic
    if (course) {
      return res.status(200).json({
        success: true,
        message: "Payment initiated",
        user: { id: user._id, name: user.name, email: user.email,coursesenrolled:user.coursesenrolled},
        course,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Course not provided",
    });
  } catch (error) {
    console.error("PayperCourse error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
