import express from 'express'
const router=express.Router()
import {PayperCourse} from '../controllers/paymentController.js'
import {authenticateToken} from '../middleware/authmiddleware.js'
router.post('/',PayperCourse)

export default router