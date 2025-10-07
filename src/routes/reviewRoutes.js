import express from 'express'
import { addAppReview, getReviews } from '../controllers/AppReviewController.js';
 const router=express.Router()
router.post('/add',addAppReview)
router.get('/',getReviews)

export default router
