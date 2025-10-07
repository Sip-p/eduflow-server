// server/src/routes/groupchatRoutes.js
import express from "express";
import { getAllMessage } from "../controllers/GroupChatController.js";

const router = express.Router();

router.get("/:courseId", getAllMessage);

export default router;
