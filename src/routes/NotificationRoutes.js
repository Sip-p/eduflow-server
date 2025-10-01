import express from 'express'
import { getAllNotifications } from '../controllers/NotificationController.js'
const router=express.Router()
router.get('/',getAllNotifications)
export default router
