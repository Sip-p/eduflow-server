import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from './src/config/db.js'
import cloudinary from 'cloudinary'
import authRoutes from './src/routes/authRoutes.js'
import uploadRoutes from './src/routes/uploadRoutes.js'
import courseRoutes from './src/routes/courseRoutes.js' 
import paymentRoutes from './src/routes/paymentRoutes.js'
import notificationRoutes from './src/routes/notificationRoute.js'
import cors from 'cors'
import {createServer} from 'http'
import {Server} from "socket.io"
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

cloudinary.v2.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Add app.use() and complete the origin URL
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
 

// Middleware
app.use(express.json());
connectDB()

// Home route
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

app.use('/api/auth',authRoutes)
app.use('/api/upload',uploadRoutes)
app.use('/api/course',courseRoutes)
app.use('/api/payment',paymentRoutes)
app.use('/api/notification',notificationRoutes)
const server=createServer(app);
const io=new Server(server,{
  cors:{
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods:["GET","POST"]

  }
})

io.on("connection",(socket)=>{
  console.log("connected Socket",socket.id)
  socket.on("newcourse",(courseData)=>{
    io.emit("courseNotification",courseData)
  })
  socket.on("joinCourse",(courseId)=>{
    socket.join(courseId)
    console.log(`User ${socket.id} joined course ${courseId}`)
  })
  socket.on("sendMessage",({courseId,user,message})=>{
    io.to(courseId).emit("receiveMessage",{user,message})
  })
  socket.on("disconnect",()=>{
    console.log("User disconnected",socket.id)
  })
})
 

// Start server

server.listen(PORT, () => {
  console.log(`✅ Server running on  ${PORT}`);
});
