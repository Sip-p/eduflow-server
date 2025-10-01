import express from 'express'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from "nodemailer"
import multer from 'multer'
 import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const generateToken=(userId)=>{
    return jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE||'7d'})
}
export const UserLogin = async (req, res) => {
    try {
        const { email, password } = req.body; // Direct destructuring
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            });
        }

        const student = await User.findOne({ email }).select('+password');
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid password" 
            });
        }
const token=generateToken(student._id);
        return res.status(200).json({ 
            success: true, 
            message: "Login successful",token,
            user: {
                id: student._id,
                name: student.name,
                email: student.email,
                role: student.role,
                pic: student.pic
            }
        });
        
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
}
 

 //  import generateToken from '../utils/generateToken.js';

export const UserSignUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const file = req.file; // from multer

    if (!name || !email || !password || !file||!role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and profile picture are required"
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: 'profile_pics',
      width: 150,
      crop: 'scale'
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      pic: result.secure_url // store Cloudinary URL
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    // console.log("reached");
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "10m" });

    // Save token & expiry in DB
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("Send email with this link", resetUrl);

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP verification failed:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

    const mailOptions = {
      from: `"EduFlow Support"<${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password reset request",
      html: `
        <p>Hello ${user.name || "User"},</p>
        <p>You requested to reset your password. Click the link below:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn’t request this, please ignore the email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    // console.error("Request password reset error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check expiry if stored in DB
    if (user.resetToken !== token || user.resetTokenExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
       const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    // make sure your model hashes it before save
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};



