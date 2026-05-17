import express from 'express'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from "nodemailer"
import multer from 'multer'
import cloudinary from 'cloudinary';
import path from 'path'
import fs from "fs";
import transporter from '../../config/mailer.js'
import { isEmailDomainValid } from '../utils/checkEmailDomail.js'
//ERROR HANDLING
import { AppError } from "../middleware/errorMiddleware.js"
import { catchAsync } from '../utils/catchAsync.js';
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//generate token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' })
}

//✨✨✨Corrrect one User login-Without error handling
// export const UserLogin = async (req, res) => {
//     try {
//         const { email, password } = req.body; // Direct destructuring

//         if (!email || !password) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Email and password are required" 
//             });
//         }

//         const student = await User.findOne({ email }).select('+password');

//         if (!student) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "User not found" 
//             });
//         }

//         const isMatch = await bcrypt.compare(password, student.password);

//         if (!isMatch) {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: "Invalid password" 
//             });
//         }
//         if(!student.emailVerified){
//           return res.status(403).json({
//             success:false,
//             message:"Please verify your email before logging in"
//           })
//         }
// const token=generateToken(student._id);

//         return res.status(200).json({ 
//             success: true, 
//             message: "Login successful",token,
//             user: {
//                 id: student._id,
//                 name: student.name,
//                 email: student.email,
//                 role: student.role,
//                 pic: student.pic
//             }
//         });

//     } catch (error) {
//         return res.status(500).json({ 
//             success: false, 
//             message: "Server error", 
//             error: error.message 
//         });
//     }
// }




//User login-With error handling________-----Testing🛑🛑🛑
export const UserLogin = catchAsync(async (req, res, next) => {

  const { email, password } = req.body; // Direct destructuring

  if (!email || !password) {

    return next(new AppError("Email and password are required", 400));
  }

  const student = await User.findOne({ email }).select('+password');

  if (!student) {
    return next(new AppError("User not found", 404));
  }

  const isMatch = await bcrypt.compare(password, student.password);

  if (!isMatch) {
    return next(new AppError("Invalid password...✨✨✨", 401));
  }
  if (!student.emailVerified) {
    return next(new AppError("Please verify your email before logging in", 403));
  }
  const token = generateToken(student._id);

  return res.status(200).json({
    success: true,
    message: "Login successful", token,
    user: {
      id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      pic: student.pic
    }
  });


})

// export const UserSignUp = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     const file = req.file; // from multer
// console.log("role--",role)
//     if (!name || !email || !password ||!role) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, email, password and profile picture are required"
//       });
//     }

//     // Upload to Cloudinary
//     const result = await cloudinary.v2.uploader.upload(file.path, {
//       folder: 'profile_pics',
//       width: 150,
//       crop: 'scale'
//     });

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       pic: result.secure_url // store Cloudinary URL
//     });

//     const token = generateToken(user._id);

//     // res.status(201).json({
//     //   success: true,
//     //   message: "User created successfully",
//     //   token,
//     //   user: {
//     //     id: user._id,
//     //     name: user.name,
//     //     email: user.email,
//     //     pic: user.pic,
//     //     role: user.role
//     //   }
//     // });

//     res.status(201).json({
//   success: true,
//   message: "TEST RESPONSE",
//   token,
//   user: {
//     id: user._id,
//     name: user.name,
//     email: user.email,
//     pic: user.pic,
//     role: user.role,
//     testField: "HELLO_FROM_BACKEND"
//   }
// });

//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// ✨✨✨correct one
// // export const UserSignUp = async (req, res) => {

//   try {
//     const { name, email, password, role } = req.body;
//     const file = req.file;



//     if (!name || !email || !password || !role) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, email, password and role are required"
//       });
//     }

//     if (!file) {
//       return res.status(400).json({
//         success: false,
//         message: "Profile picture is required"
//       });
//     }


// const fixedPath = path.resolve(file.path);

// const result = await cloudinary.uploader.upload(fixedPath, {
//   folder: "profile_pics",
//   width: 150,
//   crop: "scale",
// });

//  fs.unlinkSync(fixedPath); 


//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       pic: result.secure_url
//     });



//     const verifyToken=crypto.randomBytes(32).toString("hex");
//     console.log("Verification token generated:", verifyToken);
//     user.emailVerificationToken=verifyToken;
//     await user.save();
// console.log("User saved with verification token:", user);
//     const verificationUrl=`${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;
//     console.log("Send email with this link",verificationUrl);

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       }
//     });

//     transporter.verify((error, success) => {
//       if (error) {
//         console.error("SMTP verification failed:", error);
//       } else {
//         console.log("SMTP server is ready to send emails");
//       }
//     });

//     const mailOptions = {
//       from: `"EduFlow Support"<${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: "Email Verification",
//       html: `
//         <p>Hello ${user.name || "User"},</p>
//         <p>Thank you for signing up. Please verify your email by clicking the link below:</p>
//         <a href="${verificationUrl}">${verificationUrl}</a>
//         <p>If you didn’t create an account, please ignore this email.</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(201).json({
//       success: true,
//       message: "User created successfully. Please check your email to verify your account.",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         pic: user.pic,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// // };











export const UserSignUp = catchAsync(async (req, res, next) => {
  const file = req.file;
  let cloudinaryPublicId = null;


  const { name, email, password, role } = req.body;

  // ── 1. Validate all required fields ────────────────────────────────────
  if (!name || !email || !password || !role) {
    if (file) fs.unlinkSync(path.resolve(file.path));
    return next(new AppError("all fields are required", 400));
  }

  if (!file) {
    return next(new AppError("Profile pic is required", 400))
  }

  // ── 2. Check email already registered ──────────────────────────────────
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    fs.unlinkSync(path.resolve(file.path));
    return next(new AppError("Already Exists", 400))
  }

  // ── 3. Check MX records — free domain validation ───────────────────────
  const domainValid = await isEmailDomainValid(email);
  // if (!domainValid) {
  //   console.log("Checking email:", email);
  //    fs.unlinkSync(path.resolve(file.path));
  //   return next(new AppError("Invalid Email domain",400))
  // }
  if (!domainValid) {
    console.warn("Invalid domain but allowing:", email);
  }

  // ── 4. Send verification email BEFORE creating user ────────────────────
  const verifyToken = crypto.randomBytes(32).toString('hex');
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;

  try {
    await transporter.sendMail({
      from: `"EduFlow Support" <${process.env.BREVO_EMAIL}>`,
      to: email,
      subject: 'Verify your EduFlow account',
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px;">
            <h2>Welcome to EduFlow, ${name}!</h2>
            <p>Please verify your email address by clicking the button below.</p>
            <a href="${verificationUrl}" 
               style="background:#4F46E5;color:white;padding:12px 24px;
                      border-radius:6px;text-decoration:none;display:inline-block;">
              Verify Email
            </a>
            <p style="color:#666;font-size:13px;margin-top:16px;">
              This link expires in <strong>1 hour</strong>.<br/>
              If you didn't sign up, ignore this email.
            </p>
          </div>
        `,
    });
  } catch (emailError) {

    console.error("EMAIL ERROR:", emailError);

    fs.unlinkSync(path.resolve(file.path));

    return next(
      new AppError(
        emailError.message || "Failed to send verification email",
        400
      )
    );
  }

  // ── 5. Upload to Cloudinary only after email succeeded ─────────────────
  try {




    const fixedPath = path.resolve(file.path);
    const uploadResult = await cloudinary.v2.uploader.upload(fixedPath, {
      folder: 'profile_pics',
      width: 150,
      crop: 'scale',
    });
    cloudinaryPublicId = uploadResult.public_id;
    fs.unlinkSync(fixedPath);

    // ── 6. Hash password ───────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── 7. Create user in DB ───────────────────────────────────────────────
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      pic: uploadResult.secure_url,
      emailVerificationToken: verifyToken,
      emailVerified: false,
      // verificationExpiry defaults to now + 1 hour (set in schema)
    });

    // ── 8. Respond ─────────────────────────────────────────────────────────
    return res.status(201).json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        role: user.role,
      },
    });

  }
  catch (error) {
    // If DB save failed but Cloudinary upload succeeded → clean up Cloudinary
    if (cloudinaryPublicId) {
      await cloudinary.v2.uploader.destroy(cloudinaryPublicId).catch(() => { });
    }
    if (file && fs.existsSync(path.resolve(file.path))) {
      fs.unlinkSync(path.resolve(file.path));
    }
    return next(error)
  }
}
)

























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


export const resetPasswordFromSettings = async (req, res) => {
  console.log("Reace")
  try {

    const authorization = req.headers["authorization"]
    console.log(authorization)
    const token = authorization.split(" ")[1]
    console.log("**********", token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("_______________", decoded.id)
    const user = await User.findById(decoded.id)
    console.log("The user is______", user)
    const { password } = req.body
    console.log("Password____", password)
    if (!password) {
      return
    }
    const newPassword = await bcrypt.hash(password, 10)
    user.password = newPassword
    await user.save();

    console.log("New User", user)
    return res.status(201).json({ success: true, user })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }


}

// export const verifyEmail=async(req,res)=>{
//   try {
//     const {token}=req.params
//     const user=await User.findOne({emailVerificationToken:token})
//     if(!user){
//       return res.status(400).json({success:false,message:"Invalid token or Link expired"})
//     }
//      user.emailVerified = true;
//     user.emailVerificationToken = undefined;
//     await user.save();
//     return res.status(200).json({success:true,message:"Email verified successfully"})
//   } catch (error) {
//     return res.status(500).json({success:false,message:error.message})
//   }
// }

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    console.log("TOKEN RECEIVED IN VERIFY:", token);

    const user = await User.findOne({
      emailVerificationToken: token
    });

    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token or Link expired"
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};