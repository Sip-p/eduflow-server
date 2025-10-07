// import express from "express";
// import dotenv from "dotenv";
// import bcrypt from "bcryptjs";
// import connectDB from './src/config/db.js'
// import cloudinary from 'cloudinary'
// import authRoutes from './src/routes/authRoutes.js'
// import uploadRoutes from './src/routes/uploadRoutes.js'
// import courseRoutes from './src/routes/courseRoutes.js' 
// import paymentRoutes from './src/routes/paymentRoutes.js'
// import notificationRoutes from './src/routes/notificationRoute.js'
// import groupchatRoutes from './src/routes/groupchatRoutes.js'
// import cors from 'cors'
// import {createServer} from 'http'
// import {Server} from "socket.io"
// // Load environment variables
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// cloudinary.v2.config({
//    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// })

// // Add app.use() and complete the origin URL
// app.use(cors({
//   origin: ["http://localhost:5173", "http://localhost:3000"],
//   credentials: true
// }));
 

// // Middleware
// app.use(express.json());
// connectDB()

// // Home route
// app.get("/", (req, res) => {
//   res.send("🚀 Server is running...");
// });
 
 
// const server=createServer(app);
// const io=new Server(server,{
//   cors:{
//     origin: ["http://localhost:5173", "http://localhost:3000"],
//     methods:["GET","POST"]

//   }
// })

// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

// app.use('/api/auth',authRoutes)
// app.use('/api/upload',uploadRoutes)
// app.use('/api/course',courseRoutes)
// app.use('/api/payment',paymentRoutes)
// app.use('/api/notifications',notificationRoutes)
// app.use("/api/messages", groupchatRoutes);

// io.on("connection",(socket)=>{
//   console.log("connected Socket",socket.id)
//   socket.on("newcourse",(courseData)=>{
//     io.emit("courseNotification",courseData)
//   })
//   socket.on("joinCourse",(courseId)=>{
//     socket.join(courseId)
//     console.log(`User ${socket.id} joined course ${courseId}`)
//   })

//   socket.to(courseId).emit("UserJoined",{message:"SomeOne joined the chat"})
//   socket.on("sendMessage",({courseId,user,message})=>{
//     io.to(courseId).emit("receiveMessage",{user,message})
//   })
//   socket.on("disconnect",()=>{
//     console.log("User disconnected",socket.id)
//   })
// })
 

// // Start server

// server.listen(PORT, () => {
//   console.log(`✅ Server running on  ${PORT}`);
// });


import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import cloudinary from "cloudinary";
import authRoutes from "./src/routes/authRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import notificationRoutes from "./src/routes/notificationRoute.js";
import groupchatRoutes from './src/routes/groupchatRoutes.js'
import reviewRoutes from './src/routes/reviewRoutes.js' 
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import GroupMessage from "./src/models/GroupMessage.js";
import accountdeleteRoutes from './src/routes/accountdeleteRoutes.js'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middlewares
app.use(
  cors({
   origin: [ process.env.FRONTEND_URL || "http://localhost:5173",
  process.env.BACKEND_URL || "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

// DB connect
connectDB();

// Home route
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", groupchatRoutes);
app.use("/api/review",reviewRoutes)
app.use("/api/delete",accountdeleteRoutes)
// Create HTTP + Socket.io server
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [ process.env.FRONTEND_URL || "http://localhost:5173",
  process.env.BACKEND_URL || "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

// Middleware to attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // Course notification (when instructor creates a new course)
  socket.on("newcourse", (courseData) => {
    io.emit("courseNotification", courseData);
    console.log("📢 Course notification sent:", courseData.title);
  });

  // Join course room
  socket.on("joinCourse", (courseId) => {
    socket.join(courseId);
    console.log(`✅ User ${socket.id} joined course ${courseId}`);

    // Notify others in the room
    socket.to(courseId).emit("userJoined", {
      message: "A new user joined the chat",
    });
  });

  // Handle messages
 socket.on("sendMessage", async ({ courseId, user, message }) => {
  try {
    if (!user?._id) {
      console.warn("❌ Missing user._id in message");
      return;
    }

    const newMsg = await GroupMessage.create({
      courseId,
      sender: user._id,  // ✅ save ObjectId in DB
      message,
      timestamp: new Date(),
    });

    const populatedMsg = await newMsg.populate("sender", "name pic");

    // Send to everyone in the course room
    io.to(courseId).emit("receiveMessage", {
      _id: populatedMsg._id,
      user: {
        name: populatedMsg.sender.name,
        avatar: populatedMsg.sender.pic,
      },
      message: populatedMsg.message,
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

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on ${PORT}`);
});
