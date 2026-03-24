import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import cloudinary from "cloudinary";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./src/routes/authRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import notificationRoutes from "./src/routes/notificationRoute.js";
import groupchatRoutes from "./src/routes/groupchatRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";
import cloudinaryRoutes from "./src/routes/cloudinaryRoutes.js";
import accountdeleteRoutes from "./src/routes/accountdeleteRoutes.js";
import assignmentsRoutes from "./src/routes/assignmentsRoutes.js";
import GroupMessage from "./src/models/GroupMessage.js";
import morgan from "morgan";

import { AppError, errorHandler } from "../server/src/middleware/errorMiddleware.js";
dotenv.config();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "https://eduflow-client-jgsd.vercel.app",
  "https://eduflow-client-382a.vercel.app",
  /^https:\/\/eduflow-client-jgsd.*\.vercel\.app$/,
  /^https:\/\/eduflow-client-382a.*\.vercel\.app$/,
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsHandler = (origin, callback) => {
  if (!origin) return callback(null, true);
  const allowed = allowedOrigins.some((o) =>
    o instanceof RegExp ? o.test(origin) : o === origin
  );
  allowed ? callback(null, true) : callback(new Error("Not allowed by CORS"));
};

// ─── APP + SERVER + SOCKET SETUP (must happen before routes) ──────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ create http server and io FIRST — before any routes
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsHandler,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ─── CLOUDINARY ───────────────────────────────────────────────────────────────
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── GLOBAL MIDDLEWARE ────────────────────────────────────────────────────────
app.use(cors({ origin: corsHandler, credentials: true }));
app.use(express.json());
// Add this after app.use(express.json());
app.use(morgan('dev')); // or 'combined' for more detail
// ✅ attach io to req BEFORE routes so every controller has access to req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

connectDB();

// ─── ROUTES (after io middleware) ─────────────────────────────────────────────
app.get("/", (req, res) => res.send("🚀 Server is running..."));
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", groupchatRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/delete", accountdeleteRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);


// ─── ERROR HANDLING ───────────────────────────────────────────────────────────
app.use(errorHandler);


// ─── SOCKET LOGIC ─────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // ✅ user joins their personal notification room after login
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`🔔 User ${userId} joined their notification room`);
  });

  // join a course room for group chat
  socket.on("joinCourse", (courseId) => {
    socket.join(courseId);
    console.log(`✅ User ${socket.id} joined course ${courseId}`);
    socket.to(courseId).emit("userJoined", { message: "A new user joined the chat" });
  });

  // group chat messages
  socket.on("sendMessage", async ({ courseId, user, message }) => {
    try {
      if (!user?._id) {
        console.warn("❌ Missing user._id in message");
        return;
      }
      const newMsg = await GroupMessage.create({
        courseId,
        sender: user._id,
        message,
        timestamp: new Date(),
      });
      const populatedMsg = await newMsg.populate("sender", "name pic");
      io.to(courseId).emit("receiveMessage", {
        _id:       populatedMsg._id,
        user:      { name: populatedMsg.sender.name, avatar: populatedMsg.sender.pic },
        message:   populatedMsg.message,
        timestamp: populatedMsg.timestamp,
      });
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ─── EXPORT io (used in controllers via import) ───────────────────────────────
export { io };

// ─── START ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});