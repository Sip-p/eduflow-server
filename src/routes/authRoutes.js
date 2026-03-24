import express from "express"
import {UserLogin,UserSignUp,verifyEmail} from '../controllers/authController.js'
import { requestPasswordReset, resetPassword,resetPasswordFromSettings } from "../controllers/authController.js";
import multer from 'multer';
import rateLimit from "express-rate-limit";

// ── Limiters ──────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 5,                    // max 5 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1',
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes."
  }
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10,                   // max 10 signups per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1',
  message: {
    success: false,
    message: "Too many accounts created. Please try again later."
  }
});

 
const upload = multer({ dest: 'uploads/' });
const router=express.Router()

router.post('/user-login',loginLimiter,UserLogin)
router.post('/user-signup',signupLimiter,upload.single('file'),UserSignUp)
router.get("/verify-email/:token",verifyEmail) 
 
router.post("/reset-request", requestPasswordReset);
 
router.post("/reset-password/:token", resetPassword);
router.post("/reset-setting-password",resetPasswordFromSettings)
// router.post('/admin-login',adminLogin)
// router.post('/admin-signup',adminsignup)
// router.post('/teacher-login',teacherLogin)
// router.post('/teacher-signup',teacherSignup)

export default router