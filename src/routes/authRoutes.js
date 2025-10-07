import express from "express"
import {UserLogin,UserSignUp} from '../controllers/authController.js'
import { requestPasswordReset, resetPassword,resetPasswordFromSettings } from "../controllers/authController.js";
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
const router=express.Router()

router.post('/user-login',UserLogin)
router.post('/user-signup',upload.single('file'),UserSignUp)
 
 
router.post("/reset-request", requestPasswordReset);
 
router.post("/reset-password/:token", resetPassword);
router.post("/reset-setting-password",resetPasswordFromSettings)
// router.post('/admin-login',adminLogin)
// router.post('/admin-signup',adminsignup)
// router.post('/teacher-login',teacherLogin)
// router.post('/teacher-signup',teacherSignup)

export default router