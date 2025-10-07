// import express from 'express'
// const router=express.Router()
// import {PayperCourse} from '../controllers/paymentController.js'
// import {authenticateToken} from '../middleware/authmiddleware.js'
// router.post('/create-order',PayperCourse)
// // router.post('/')

// export default router


import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);

export default router;
