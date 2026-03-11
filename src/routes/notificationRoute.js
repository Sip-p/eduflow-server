import express from "express";
import { getAllNotifications } from "../controllers/NotificationController.js";
import { authenticateToken } from "../middleware/authmiddleware.js";
const router = express.Router();

router.get("/", authenticateToken, getAllNotifications);

export default router;