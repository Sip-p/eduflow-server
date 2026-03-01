// // import mongoose from "mongoose";
// // import Course from "../models/Course.js";
// // import jwt from "jsonwebtoken";
// // // import Notification from '../models/'
// // import User from "../models/User.js";
// // import Notification from "../models/Notification.js";
// // import Assignment from "../models/Assignment.js"
// // import { Socket } from "socket.io";

// // // Get all courses with pagination and filtering
// // // export const getAllCourses = async (req, res) => {
// // //   try{
// // //     const allcourses=await Course.find().populate('instructor','name email pic')
// // //     if(!allcourses){
// // //       res.status(200).json({success:false})
// // //     }
// // //     res.status(200).json({success:true,courses:allcourses})
// // //   } catch (error) {
// // //     console.error('Get all courses error:', error);
// // //     res.status(500).json({ message: "Server Error", error: error.message });
// // //   }
// // // };
// // export const getAllCourses = async (req, res) => {
// //   try {
// //     const { 
// //       category, 
// //       published, 
// //       minPrice, 
// //       maxPrice,
// //       search,
// //       sort = 'createdAt',
// //       order = 'desc'
// //     } = req.query;

// //     // Build match stage - NO studentsCount filter
// //     const matchStage = {};
    
// //     if (category) matchStage.category = category;
    
// //     // ✅ Only filter by published if explicitly set
// //     if (published !== undefined && published !== '') {
// //       matchStage.published = published === 'true';
// //     }
    
// //     if (minPrice || maxPrice) {
// //       matchStage.price = {};
// //       if (minPrice) matchStage.price.$gte = Number(minPrice);
// //       if (maxPrice) matchStage.price.$lte = Number(maxPrice);
// //     }

// //     if (search) {
// //       matchStage.$or = [
// //         { title: { $regex: search, $options: 'i' } },
// //         { description: { $regex: search, $options: 'i' } }
// //       ];
// //     }

// //     // console.log('Match Stage:', matchStage); // ✅ Debug log

// //     const pipeline = [
// //       // Only add $match if there are actual filters
// //       ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      
// //       {
// //         $lookup: {
// //           from: "users",
// //           localField: "instructor",
// //           foreignField: "_id",
// //           as: "instructorData"
// //         }
// //       },
      
// //       {
// //         $unwind: {
// //           path: "$instructorData",
// //           preserveNullAndEmptyArrays: true // ✅ Keep courses without instructor
// //         }
// //       },
      
// //       {
// //         $addFields: {
// //           lessonCount: { $size: { $ifNull: ["$lessons", []] } },
// //           instructor: {
// //             _id: "$instructorData._id",
// //             name: "$instructorData.name",
// //             email: "$instructorData.email",
// //             pic: "$instructorData.pic"
// //           }
// //         }
// //       },
      
// //       {
// //         $project: {
// //           instructorData: 0
// //         }
// //       },
      
// //       {
// //         $sort: { [sort]: order === 'desc' ? -1 : 1 }
// //       }
// //     ];

// //     const courses = await Course.aggregate(pipeline);

// //     console.log('Total courses found:', courses.length); // ✅ Debug log

// //     res.status(200).json({
// //       success: true,
// //       courses,
// //       total: courses.length
// //     });
    
// //   } catch (error) {
// //     console.error('Get all courses error:', error);
// //     res.status(500).json({ 
// //       message: "Server Error", 
// //       error: error.message 
// //     });
// //   }
// // };

// // // Get course by ID with full details
// // export const getCourseById = async (req, res) => {
// //   try {
// //     const { id } = req.params;
    
// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return res.status(400).json({ message: "Invalid course ID" });
// //     }
// //     const course=await Course.findById(id)
// //     // console.log("Course found:",course)

// //     const courseInstructor = await Course.findById(id)
// //       .populate('instructor', 'name email pic ')
      

// //     if (!course) {
// //       return res.status(404).json({ message: "Course not found" });
// //     }

     

// //     res.status(200).json(course);
// //   } catch (error) {
// //     console.error('Get course by ID error:', error);
// //     res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };

  
// // //   try {
// // //     const { 
// // //       title, 
// // //       description, 
// // //       price, 
// // //       category,
// // //       thumbnail,
// // //       lessons,
// // //       published = false 
// // //     } = req.body;
// // //     console.log('=== CREATE COURSE DEBUG ===');
// // //     console.log('Headers:', req.headers);
// // //     console.log('Body:', req.body);
// // //     console.log('Body type:', typeof req.body);
// // //     console.log('Body keys:', Object.keys(req.body || {}));
// // //     const instructorId = req.user.id; // From auth middleware

// // //     // Validation
// // //     if (!title || !description || !price) {
// // //       return res.status(400).json({ 
// // //         message: "Title, description, and price are required" 
// // //       });
// // //     }

// // //     if (price < 0) {
// // //       return res.status(400).json({ 
// // //         message: "Price must be a positive number" 
// // //       });
// // //     }

// // //     if (!category) {
// // //       return res.status(400).json({ 
// // //         message: "Category is required" 
// // //       });
// // //     }

// // //     if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
// // //       return res.status(400).json({ 
// // //         message: "At least one lesson is required" 
// // //       });
// // //     }

// // //     // Validate lessons
// // //     for (let i = 0; i < lessons.length; i++) {
// // //       const lesson = lessons[i];
// // //       if (!lesson.title || !lesson.videoUrl) {
// // //         return res.status(400).json({ 
// // //           message: `Lesson ${i + 1} must have title and video URL` 
// // //         });
// // //       }
// // //     }

// // //     // Create course
// // //     const newCourse = new Course({
// // //       title: title.trim(),
// // //       description: description.trim(),
// // //       price: parseFloat(price),
// // //       category: category.trim(),
// // //       instructor: instructorId,
// // //       thumbnail: thumbnail || '',
// // //       lessons: lessons.map((lesson, index) => ({
// // //         title: lesson.title.trim(),
// // //         description: lesson.description ? lesson.description.trim() : '',
// // //         videoUrl: lesson.videoUrl,
// // //         duration: lesson.duration || 0,
// // //         order: index + 1
// // //       })),
// // //       published: Boolean(published),
// // //       createdAt: new Date(),
// // //       updatedAt: new Date()
// // //     });

// // //     await newCourse.save();
    
// // //     // Populate instructor info before returning
// // //     await newCourse.populate('instructor', 'name email pic');

// // //     res.status(201).json({
// // //       message: "Course created successfully",
// // //       course: newCourse
// // //     });

// // //   } catch (error) {
// // //     console.error('Create course error:', error);
    
// // //     // Handle duplicate key errors
// // //     if (error.code === 11000) {
// // //       return res.status(400).json({ 
// // //         message: "A course with this title already exists" 
// // //       });
// // //     }
    
// // //     res.status(500).json({ 
// // //       message: "Server Error", 
// // //       error: error.message 
// // //     });
// // //   }
// // // };

// // //done****

// // // export const createCourse = async (req, res) => {
// // //   try {
   

// // //     const { title, description, price, category, thumbnail, lessons, published = false } = req.body;

// // //     // Check JWT in Authorization header
// // //     const authHeader = req.headers.authorization;
// // //     if (!authHeader || !authHeader.startsWith('Bearer ')) {
// // //       return res.status(401).json({ message: "Authentication required" });
// // //     }

// // //     const token = authHeader.split(' ')[1];
// // //     let decoded;
// // //     try {
// // //       decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //     } catch (err) {
// // //       return res.status(401).json({ message: "Invalid token" });
// // //     }

// // //     const instructorId = decoded.id; // Use JWT ID

// // //     // Validation
// // //     if (!title || !description || !price || !category || !lessons || !Array.isArray(lessons) || lessons.length === 0) {
// // //       return res.status(400).json({ message: "Missing required fields or lessons" });
// // //     }

// // //     if (isNaN(price) || price < 0) {
// // //       return res.status(400).json({ message: "Price must be a valid positive number" });
// // //     }

// // //     // Validate each lesson
// // //     for (let i = 0; i < lessons.length; i++) {
// // //       const lesson = lessons[i];
// // //       if (!lesson.title || !lesson.videoUrl) {
// // //         return res.status(400).json({ message: `Lesson ${i + 1} must have title and video URL` });
// // //       }
// // //     }

// // //     // Create course
// // //     const newCourse = new Course({
// // //       title: title.trim(),
// // //       description: description.trim(),
// // //       price: parseFloat(price),
// // //       category: category.trim(),
// // //       instructor: instructorId,
// // //       thumbnail: thumbnail || '',
// // //       lessons: lessons.map((lesson, index) => ({
// // //         title: lesson.title.trim(),
// // //         description: lesson.description ? lesson.description.trim() : '',
// // //         videoUrl: lesson.videoUrl,
// // //         duration: lesson.duration || 0,
// // //         order: index + 1
// // //       })),
// // //       published: Boolean(published),
// // //       studentsEnrolled: [],
// // //       studentsCount: 0,
// // //       createdAt: new Date(),
// // //       updatedAt: new Date()
// // //     });

// // //     await newCourse.save();
// // //  const notification = await Notification.create({
// // //   course: newCourse._id,
// // //   title: newCourse.title,
// // //   createdBy: decoded.name || "Instructor Name", // make sure you have instructor name
// // //   read: false,
// // // });

 
// // //       req.io.emit("courseNotification", {
// // //       id: notification._id,
// // //       message: notification.message,
// // //       course: newCourse.title,
// // //       createdAt: notification.createdAt,
// // //     });
// // //     res.status(201).json({
// // //       message: "Course created successfully",
// // //       course: {
// // //         id: newCourse._id,
// // //         title: newCourse.title,
// // //         lessonsCount: newCourse.lessons.length,
// // //         price: newCourse.price
// // //       }
// // //     });

// // //   } catch (error) {
// // //      res.status(500).json({ message: "Server Error", error: error.message });
// // //   }
// // // };

// // // export const createCourse = async (req, res) => {
// // //   try {
// // //     const { title, description, price, category, thumbnail, lessons, published=false } = req.body;
    
// // //     const authHeader = req.headers.authorization;
// // //     if (!authHeader || !authHeader.startsWith("Bearer ")) {
// // //       return res.status(401).json({ message: "Authentication required" });
// // //     }
    
// // //     const token = authHeader.split(" ")[1];
// // //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //     const instructorId = decoded.id;

// // //     // Fetch instructor name
// // //     const instructor = await User.findById(instructorId);
// // //     if (!instructor) return res.status(404).json({ message: "Instructor not found" });

// // //     // Validation
// // //    //     // Validation
// // //     if (!title || !description || !price || !category || !lessons || !Array.isArray(lessons) || lessons.length === 0) {
// // //       return res.status(400).json({ message: "Missing required fields or lessons" });
// // //     }
// // // // consolle.log("++++++++++++++++++")
// // // // console.log(lessons)
// // // // consolle.log("++++++++++++++++++")
// // //     if (isNaN(price) || price < 0) {
// // //       return res.status(400).json({ message: "Price must be a valid positive number" });
// // //     }

// // //     // Validate each lesson
// // //     for (let i = 0; i < lessons.length; i++) {
// // //       const lesson = lessons[i];
// // //       if (!lesson.title || !lesson.videoUrl) {
// // //         return res.status(400).json({ message: `Lesson ${i + 1} must have title and video URL` });
// // //       }
// // //     }

// // //     const newCourse = new Course({
// // //       title, description, price, category, instructor: instructorId,
// // //       thumbnail: thumbnail || "",
// // //       lessons: lessons.map((l, i) => ({ ...l, order: i+1 })),
// // //       published,
// // //       studentsEnrolled: [], studentsCount: 0,
// // //       createdAt: new Date(), updatedAt: new Date()
// // //     });

// // //     await newCourse.save();

// // //   const notification = await Notification.create({
// // //   course: newCourse._id,
// // //   title: newCourse.title,
// // //   createdBy: decoded.name || "Instructor Name",
// // //   message: `New course created: ${newCourse.title} by ${decoded.name || "Instructor"}`,
// // //   read: false,
// // // });


// // //     // Emit notification via Socket.IO
// // //     // req.io.emit("courseNotification", {
// // //     //   id: notification._id,
// // //     //   title: notification.title,
// // //     //   createdBy: notification.createdBy,
// // //     //   course: newCourse.title,
// // //     //   createdAt: notification.createdAt
// // //     // });

// // //     res.status(201).json({
// // //       message: "Course created successfully",
// // //       course: {
// // //         id: newCourse._id,
// // //         title: newCourse.title,
// // //         lessonsCount: newCourse.lessons.length,
// // //         price: newCourse.price
// // //       }
// // //     });

// // //   } catch (error) {
// // //     console.error("Create course error:", error);
// // //     res.status(500).json({ message: "Server Error", error: error.message });
// // //   }
// // // };

// // export const createCourse = async (req, res) => {
// //   try {
// //     const { title, description, price, category, thumbnail, lessons, published = false } = req.body;
    
// //     const authHeader = req.headers.authorization;
// //     if (!authHeader || !authHeader.startsWith("Bearer ")) {
// //       return res.status(401).json({ message: "Authentication required" });
// //     }
    
// //     const token = authHeader.split(" ")[1];
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     const instructorId = decoded.id;

// //     // Fetch instructor name
// //     const instructor = await User.findById(instructorId);
// //     if (!instructor) return res.status(404).json({ message: "Instructor not found" });

// //     // Validation - FIXED: Check for undefined/null instead of falsy values
// //     if (!title || !description || price === undefined || price === null || !category || !lessons || !Array.isArray(lessons) || lessons.length === 0) {
// //       return res.status(400).json({ message: "Missing required fields or lessons" });
// //     }

// //     // Validate price is a valid number
// //     const parsedPrice = parseFloat(price);
// //     if (isNaN(parsedPrice) || parsedPrice < 0) {
// //       return res.status(400).json({ message: "Price must be a valid positive number" });
// //     }

// //     // Validate each lesson
// //     for (let i = 0; i < lessons.length; i++) {
// //       const lesson = lessons[i];
// //       if (!lesson.title || !lesson.videoUrl) {
// //         return res.status(400).json({ message: `Lesson ${i + 1} must have title and video URL` });
// //       }
// //     }

// //     const newCourse = new Course({
// //       title, 
// //       description, 
// //       price: parsedPrice, // Use parsed price
// //       category, 
// //       instructor: instructorId,
// //       thumbnail: thumbnail || "",
// //       lessons: lessons.map((l, i) => ({ ...l, order: i + 1 })),
// //       published,
// //       studentsEnrolled: [], 
// //       studentsCount: 0,
// //       createdAt: new Date(), 
// //       updatedAt: new Date()
// //     });

// //     await newCourse.save();

// //     const notification = await Notification.create({
// //       course: newCourse._id,
// //       title: newCourse.title,
// //       createdBy: decoded.name || "Instructor Name",
// //       message: `New course created: ${newCourse.title} by ${decoded.name || "Instructor"}`,
// //       read: false,
// //     });

// //     res.status(201).json({
// //       message: "Course created successfully",
// //       course: {
// //         id: newCourse._id,
// //         title: newCourse.title,
// //         lessonsCount: newCourse.lessons.length,
// //         price: newCourse.price
// //       }
// //     });

// //   } catch (error) {
// //     console.error("Create course error:", error);
// //     res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };

// // // Update a course
// // // export const updateCourse = async (req, res) => {
// // //  try{
// // //   const courseId=req.body.courseId
// // //   const authorization=req.headers["authorization"]
// // //  const status=req.body.status
// // //  console.log("sts---",status)
// // //   const token=authorization.split(" ")[1]
// // //  if(!token){
// // //   return res.status(401).json({success:false,message:"Unauthorized"})
// // //  }
// // //  const decoded=jwt.verify(token,process.env.JWT_SECRET)
// // //  const user=await User.findById(decoded.id)
// // //  console.log(user.courseProgress)
// // // //  const targetCourse=user.courseProgress.course.findById(courseId)
// // // //  console.log("---",targetCourse)
// // // // const course=await User.findOne({courseProgress.course._id:courseId,user})
// // // return res.status(200).json({success:true,user})
// // //   } catch (error) {
// // //     console.error('Update course error:', error);
// // //     res.status(500).json({ 
// // //       message: "Server Error", 
// // //       error: error.message 
// // //     });
// // //   }
// // // };

// // // export const updateCourse= async (req, res) => {
// // //   try {
// // //     const { courseId, status } = req.body;
// // //     const token = req.headers.authorization?.split(" ")[1];
// // //     if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

// // //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //     const user = await User.findById(decoded.id);
// // //     if (!user) return res.status(404).json({ success: false, message: "User not found" });

// // //     // Find course progress entry
// // //     let progressEntry = user.courseProgress.find(entry => entry.course.toString() === courseId);

// // //     if (progressEntry) {
// // //       // Update status
// // //       progressEntry.status = status;
// // //     } else {
// // //       // Add new progress entry if it doesn't exist
// // //       user.courseProgress.push({ course: courseId, status });
// // //     }

// // //     await user.save();
// // //     return res.status(200).json({ success: true, message: "Course progress updated", courseProgress: user.courseProgress });
// // //   } catch (error) {
// // //     console.error("Update course error:", error);
// // //     return res.status(500).json({ success: false, message: error.message });
// // //   }
// // // };


// // export const updateCourse = async (req, res) => {
// //   try {
// //     const { courseId, status } = req.body;
// //     const authheader = req.headers["authorization"];
// //     const token = authheader && authheader.split(" ")[1];
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     const userId = decoded.id;

// //     const user = await User.findById(userId);
    
// //     if (!user) {
// //       return res.status(404).json({ success: false, message: "User not found" });
// //     }

// //     // Check if progress entry exists
// //     const progressIndex = user.courseProgress.findIndex(
// //       p => p.course.toString() === courseId
// //     );

// //     if (progressIndex !== -1) {
// //       // Update existing progress
// //       user.courseProgress[progressIndex].status = status;
// //     } else {
// //       // Create new progress entry
// //       user.courseProgress.push({
// //         course: courseId,
// //         status: status
// //       });
// //     }

// //     await user.save();

// //     return res.status(200).json({ 
// //       success: true, 
// //       message: "Course status updated successfully" 
// //     });
    
// //   } catch (error) {
// //     return res.status(500).json({ 
// //       success: false, 
// //       message: error.message 
// //     });
// //   }
// // };

// // // Delete a course
// // export const deleteCourse = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return res.status(400).json({ message: "Invalid course ID" });
// //     }

// //     const course = await Course.findById(id);
// //     if (!course) {
// //       return res.status(404).json({ message: "Course not found" });
// //     }

// //     // Check if user is the instructor or admin
// //     const isInstructor = course.instructor.toString() === req.user.id;
// //     const isAdmin = req.user.role === 'admin';
    
// //     if (!isInstructor && !isAdmin) {
// //       return res.status(403).json({ 
// //         message: "You can only delete your own courses" 
// //       });
// //     }

// //     // Check if course has enrolled students
// //     if (course.studentsEnrolled && course.studentsEnrolled.length > 0) {
// //       return res.status(400).json({ 
// //         message: "Cannot delete course with enrolled students" 
// //       });
// //     }

// //     await Course.findByIdAndDelete(id);
    
// //     res.status(200).json({ 
// //       message: "Course deleted successfully" 
// //     });

// //   } catch (error) {
// //     console.error('Delete course error:', error);
// //     res.status(500).json({ 
// //       message: "Server Error", 
// //       error: error.message 
// //     });
// //   }
// // };

// // // Toggle course publish status
// // export const toggleCoursePublish = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return res.status(400).json({ message: "Invalid course ID" });
// //     }

// //     const course = await Course.findById(id);
// //     if (!course) {
// //       return res.status(404).json({ message: "Course not found" });
// //     }

// //     // Check if user is the instructor
// //     if (course.instructor.toString() !== req.user.id) {
// //       return res.status(403).json({ 
// //         message: "You can only publish/unpublish your own courses" 
// //       });
// //     }

// //     // Validate course has required content before publishing
// //     if (!course.published && (!course.lessons || course.lessons.length === 0)) {
// //       return res.status(400).json({ 
// //         message: "Cannot publish course without lessons" 
// //       });
// //     }

// //     course.published = !course.published;
// //     course.updatedAt = new Date();
// //     await course.save();

// //     await course.populate('instructor', 'name email pic');
    
// //     res.status(200).json({
// //       message: `Course ${course.published ? 'published' : 'unpublished'} successfully`,
// //       course
// //     });

// //   } catch (error) {
// //     console.error('Toggle course publish error:', error);
// //     res.status(500).json({ 
// //       message: "Server Error", 
// //       error: error.message 
// //     });
// //   }
// // };

// // // Get courses by instructor
// // //done***
// // export const getCoursesByInstructor = async (req, res) => {
// //   try{
// //     // console.log('=== GET INSTRUCTOR COURSES DEBUG ===');
// //     // console.log(req.headers)
// //     const decoded=jwt.verify(req.headers.authorization.split(" ")[1],process.env.JWT_SECRET)
// //     // console.log("Decoded JWT:",decoded)
// //     const instructorId=decoded.id
// //     const courses=await Course.find({instructor:instructorId}).populate('instructor','name email pic').sort({createdAt:-1})
// //     // console.log("Courses found:",courses)
// //     // console.log("Courses length+++++++++++",courses.length)
// //     return res.status(200).json({success:true,courses:courses,length:courses.length})
// //   }
// //   catch (error) {
// //     // console.error('Get instructor courses error:', error);
// //     return res.status(500).json({ 
// //       message: "Server Error", 
// //       error: error.message 
// //     });
// //   }
// // };

// // // Instructor dashboard data
// // export const getInstdashboarddata = async (req, res) => {
// //   try {
// //     // ✅ Verify JWT token
// //     const decoded = jwt.verify(
// //       req.headers.authorization.split(" ")[1],
// //       process.env.JWT_SECRET
// //     );
// //     const instructorId = decoded.id;

// //     // ✅ Find all courses by instructor
// //     const courses = await Course.find({ instructor: instructorId })
// //       .populate("instructor", "name email pic")
// //       .sort({ createdAt: -1 });

// //     console.log("Courses found:", courses);
// //     console.log("Courses length+++++++++++", courses.length);

// //     // ✅ Calculate total students across all courses
// //     const studentcount = courses.reduce(
// //       (sum, course) => sum + course.studentsEnrolled.length,
// //       0
// //     );

// //     // ✅ Get all assignments created by instructor
// //     const assignments = await Assignment.find({ instructor: instructorId });

// //     console.log("Student count--", studentcount);
// //     console.log("Assignments------", assignments.length);

// //     // ✅ Send proper response
// //     res.status(200).json({
// //       success: true,
// //       data: {
// //         totalCourses: courses.length,
// //         totalStudents: studentcount,
// //         totalAssignments: assignments.length,
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Error in getInstdashboarddata:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Failed to fetch instructor dashboard data",
// //       error: error.message,
// //     });
// //   }
// // };

// // // export const getMyCourses = async (req, res) => {
// // //   try {
// // //     const authheader = req.headers["authorization"];
// // //     const token = authheader && authheader.split(" ")[1];
// // //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //     const id = decoded.id;

// // //     const user = await User.findById(id).populate('coursesenrolled', 'title description price category');
// // //     const demo=await User.findById(id).populate('courseProgress','course status')
// // //     const courseId=demo.courseProgress.course
// // //     console.log("Your id-course",courseId)
// // //     console.log("The demo ---------",demo)
// // //     // const user=await User.findById(id).populate('courseProgress','course status').populate('course title desccription category')
    
// // //     if (user) {
// // //       const mycourses = user.coursesenrolled;
// // //       return res.status(200).json({ success: true, mycourses });
// // //     } else {
// // //       return res.status(400).json({ success: false, message: "user not found" });
// // //     }
// // //   } catch (error) {
// // //     return res.status(500).json({ success: false, message: error.message });
// // //   }
// // // }

// // // export const getMyCourses = async (req, res) => {
// // //   try {
// // //     const authheader = req.headers["authorization"];
// // //     const token = authheader && authheader.split(" ")[1];
// // //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // //     const id = decoded.id;
// // // console.log(id)
// // //     // Populate both coursesenrolled and courseProgress.course
// // //     const user = await User.findById(id)
// // //       .populate('coursesenrolled', 'title description price category')
// // //       .populate('courseProgress.course', 'title description price category');
// // //     console.log(user)
// // //     if (!user) {
// // //       return res.status(400).json({ success: false, message: "user not found" });
// // //     }

// // //     // Merge courses with their progress status
// // //     const coursesWithProgress = user.coursesenrolled.map(course => {
// // //       const progress = user.courseProgress.find(
// // //         p => p.course._id.toString() === course._id.toString()
// // //       );
      
// // //       return {
// // //         ...course.toObject(),
// // //         progressStatus: progress ? progress.status : 'not-started'
// // //       };
// // //     });

// // //     return res.status(200).json({ 
// // //       success: true, 
// // //       mycourses: coursesWithProgress 
// // //     });
    
// // //   } catch (error) {
// // //     return res.status(500).json({ success: false, message: error.message });
// // //   }
// // // };
 
// // export const addMyCourses=async (req,res)=>{
// //   try {
// //     const {courseId}=req.body
// //     console.log("=========>>>",courseId)
// //     const course=await Course.findById(courseId)
// //     const authheader = req.headers["authorization"];
// //     const token = authheader && authheader.split(" ")[1];
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     const id = decoded.id;
// //     const user=await User.findById(id)
// //     if(!user){
// //       return res.status(400).json({success:false,message:"user not found"})
// //     }
// //     // Avoid duplicate enrollments
// //     if (user.coursesenrolled.includes(course)) {
// //       return res.status(400).json({ success: false, message: "Already enrolled in this course" });
// //     }

// //     user.coursesenrolled.push(course);
// //     await user.save();
// //     return res.status(200).json({success:true,message:"Course added successfully to my courses"})
// //   } catch (error) {
// //     console.log(error)
// //     return res.status(500).json({success:false,message:error.message})
// //   }
// // }

// // export const getMyCourses = async (req, res) => {
// //   try {
// //     const authheader = req.headers["authorization"];
// //     const token = authheader && authheader.split(" ")[1];
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     const id = decoded.id;

// //     const user = await User.findById(id)
// //       .populate('coursesenrolled', 'title description price category')
// //       .populate('courseProgress.course', 'title description price category');

// //     if (!user) {
// //       return res.status(400).json({ success: false, message: "user not found" });
// //     }

// //     // 🔑 Merge courses with progress and filter invalid/null progress
// //     const coursesWithProgress = user.coursesenrolled.map(course => {
// //       const progress = user.courseProgress.find(
// //         p => p.course && p.course._id.toString() === course._id.toString()
// //       );
// //       return {
// //         ...course.toObject(),
// //         progressStatus: progress ? progress.status : 'not-started'
// //       };
// //     });

// //     return res.status(200).json({ success: true, mycourses: coursesWithProgress });
// //   } catch (error) {
// //     return res.status(500).json({ success: false, message: error.message });
// //   }
// // };


// // import mongoose from "mongoose";
// // import Course from "../models/Course.js";
// // import Chapter from "../models/Chapter.js";
// // import Lesson from "../models/Lesson.js";
// // import jwt from "jsonwebtoken";
// // import User from "../models/User.js";
// // import Notification from "../models/Notification.js";
// // import Assignment from "../models/Assignment.js";

// // // ─── HELPER: extract instructor ID from token ─────────────────────────────────
// // // You're repeating jwt.verify everywhere — centralize it
// // const getInstructorId = (req) => {
// //   const authHeader = req.headers.authorization;
// //   if (!authHeader?.startsWith("Bearer ")) throw new Error("Authentication required");
// //   const token = authHeader.split(" ")[1];
// //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //   return decoded.id;
// // };

// // // ─── CREATE COURSE (with chapters + lessons) ──────────────────────────────────
// // // POST /api/course/create
// // // Body: { title, description, price, category, level, thumbnail, published, chapters: [{title, order, lessons: []}] }
// // export const createCourse = async (req, res) => {
// //   // Use a session so if chapter/lesson creation fails, course is rolled back
// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     const instructorId = getInstructorId(req);
// //     const { title, description, price, category, level, thumbnail, published = false, chapters = [] } = req.body;

// //     // ── Validation ──
// //     if (!title || !description || price === undefined || !category || !thumbnail) {
// //       return res.status(400).json({ message: "Missing required fields" });
// //     }
// //     const parsedPrice = parseFloat(price);
// //     if (isNaN(parsedPrice) || parsedPrice < 0) {
// //       return res.status(400).json({ message: "Price must be a valid positive number" });
// //     }
// //     if (!chapters.length) {
// //       return res.status(400).json({ message: "At least one chapter is required" });
// //     }
// //     if (chapters.every(ch => !ch.lessons?.length)) {
// //       return res.status(400).json({ message: "At least one chapter must have lessons" });
// //     }

// //     // ── Step 1: Create the Course ──
// //     const [newCourse] = await Course.create([{
// //       title: title.trim(),
// //       description: description.trim(),
// //       price: parsedPrice,
// //       category,
// //       level: level || "beginner",
// //       thumbnail,
// //       instructor: instructorId,
// //       published,
// //       studentsEnrolled: [],
// //       totalChapters: chapters.length,
// //       totalLessons: chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0),
// //     }], { session });

// //     // ── Step 2: Create Chapters + Lessons ──
// //     let totalDuration = 0;

// //     for (let ci = 0; ci < chapters.length; ci++) {
// //       const chData = chapters[ci];

// //       if (!chData.title?.trim()) {
// //         throw new Error(`Chapter ${ci + 1} must have a title`);
// //       }

// //       // Create chapter
// //       const [newChapter] = await Chapter.create([{
// //         title: chData.title.trim(),
// //         description: chData.description?.trim() || "",
// //         course: newCourse._id,
// //         order: ci + 1,
// //         isPublished: published,
// //       }], { session });

// //       // Create lessons for this chapter
// //       const lessons = chData.lessons || [];
// //       for (let li = 0; li < lessons.length; li++) {
// //         const lessonData = lessons[li];

// //         if (!lessonData.title?.trim() || !lessonData.videoUrl) {
// //           throw new Error(`Lesson ${li + 1} in Chapter ${ci + 1} must have title and video`);
// //         }

// //         const duration = lessonData.duration || 0;
// //         totalDuration += duration;

// //         await Lesson.create([{
// //           title: lessonData.title.trim(),
// //           description: lessonData.description?.trim() || "",
// //           videoUrl: lessonData.videoUrl,
// //           duration,
// //           thumbnail: lessonData.thumbnail || "",
// //           isFree: lessonData.isFree || false,
// //           order: li + 1,
// //           chapter: newChapter._id,
// //           course: newCourse._id,        // store courseId directly on lesson for fast queries
// //         }], { session });
// //       }
// //     }

// //     // ── Step 3: Update totalDuration on course ──
// //     await Course.findByIdAndUpdate(
// //       newCourse._id,
// //       { totalDuration },
// //       { session }
// //     );

// //     // ── Step 4: Notify (outside transaction — notifications failing shouldn't rollback the course) ──
// //     await session.commitTransaction();

// //     // Create notification after commit so courseId exists in DB
// //     try {
// //       await Notification.create({
// //         recipient: instructorId,        // notify the instructor themselves (for their activity log)
// //         course: newCourse._id,
// //         message: `Your course "${newCourse.title}" was ${published ? "published" : "saved as draft"} successfully`,
// //       });
// //     } catch (notifErr) {
// //       // Don't fail the whole request if notification fails
// //       console.warn("Notification creation failed:", notifErr.message);
// //     }

// //     // Emit socket event if published
// //     if (published && req.io) {
// //       req.io.emit("newCoursePublished", {
// //         courseId: newCourse._id,
// //         title: newCourse.title,
// //         category: newCourse.category,
// //       });
// //     }

// //     return res.status(201).json({
// //       success: true,
// //       message: published ? "Course published successfully!" : "Course saved as draft",
// //       course: {
// //         id: newCourse._id,
// //         title: newCourse.title,
// //         totalChapters: chapters.length,
// //         totalLessons: chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0),
// //         published,
// //       },
// //     });

// //   } catch (error) {
// //     await session.abortTransaction();  // rollback everything if any step fails
// //     console.error("Create course error:", error);
// //     return res.status(500).json({ success: false, message: error.message });
// //   } finally {
// //     session.endSession();
// //   }
// // };

// // // ─── GET FULL CURRICULUM ──────────────────────────────────────────────────────
// // // GET /api/course/:id/curriculum
// // // Returns: Course + all chapters + all lessons nested — used on course detail page
// // export const getCourseCurriculum = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return res.status(400).json({ message: "Invalid course ID" });
// //     }

// //     // Parallel fetch — faster than sequential awaits
// //     const [course, chapters] = await Promise.all([
// //       Course.findById(id).populate("instructor", "name email pic"),
// //       Chapter.find({ course: id }).sort({ order: 1 }),
// //     ]);

// //     if (!course) return res.status(404).json({ message: "Course not found" });

// //     // Fetch all lessons for this course at once (not per chapter — one query)
// //     const allLessons = await Lesson.find({ course: id }).sort({ order: 1 });

// //     // Group lessons under their chapters
// //     const curriculum = chapters.map((ch) => ({
// //       _id: ch._id,
// //       title: ch.title,
// //       description: ch.description,
// //       order: ch.order,
// //       isPublished: ch.isPublished,
// //       lessons: allLessons
// //         .filter((l) => l.chapter.toString() === ch._id.toString())
// //         .map((l) => ({
// //           _id: l._id,
// //           title: l.title,
// //           description: l.description,
// //           duration: l.duration,
// //           isFree: l.isFree,
// //           order: l.order,
// //           // Only include videoUrl if student is enrolled OR lesson is free
// //           // This check happens on the frontend — backend sends it always for now
// //           // (add auth check here later for paid content protection)
// //           videoUrl: l.isFree ? l.videoUrl : undefined,
// //         })),
// //     }));

// //     return res.status(200).json({
// //       success: true,
// //       course: {
// //         _id: course._id,
// //         title: course.title,
// //         description: course.description,
// //         price: course.price,
// //         category: course.category,
// //         level: course.level,
// //         thumbnail: course.thumbnail,
// //         instructor: course.instructor,
// //         published: course.published,
// //         totalChapters: course.totalChapters,
// //         totalLessons: course.totalLessons,
// //         totalDuration: course.totalDuration,
// //         studentsEnrolled: course.studentsEnrolled.length,
// //         rating: course.rating,
// //       },
// //       curriculum,   // chapters with lessons nested
// //     });

// //   } catch (error) {
// //     console.error("Get curriculum error:", error);
// //     return res.status(500).json({ message: error.message });
// //   }
// // };

// // // ─── GET LESSON VIDEO (protected — only enrolled students or free lessons) ────
// // // GET /api/course/:courseId/lesson/:lessonId
// // export const getLessonVideo = async (req, res) => {
// //   try {
// //     const instructorId = getInstructorId(req);  // reuse for any authenticated user
// //     const { courseId, lessonId } = req.params;

// //     const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
// //     if (!lesson) return res.status(404).json({ message: "Lesson not found" });

// //     // Free lesson — anyone can watch
// //     if (lesson.isFree) {
// //       return res.status(200).json({ success: true, videoUrl: lesson.videoUrl });
// //     }

// //     // Paid lesson — check enrollment
// //     const user = await User.findById(instructorId);
// //     const isEnrolled = user?.coursesenrolled?.some(
// //       (c) => c.toString() === courseId
// //     );
// //     // Also allow the instructor of the course
// //     const course = await Course.findById(courseId);
// //     const isInstructor = course?.instructor.toString() === instructorId;

// //     if (!isEnrolled && !isInstructor) {
// //       return res.status(403).json({ message: "Enroll in this course to watch this lesson" });
// //     }

// //     return res.status(200).json({ success: true, videoUrl: lesson.videoUrl });

// //   } catch (error) {
// //     return res.status(500).json({ message: error.message });
// //   }
// // };

// // // ─── MARK LESSON COMPLETE ────────────────────────────────────────────────────
// // // PATCH /api/course/:courseId/lesson/:lessonId/complete
// // export const markLessonComplete = async (req, res) => {
// //   try {
// //     const userId = getInstructorId(req);  // any authenticated user
// //     const { courseId, lessonId } = req.params;

// //     const user = await User.findById(userId);
// //     if (!user) return res.status(404).json({ message: "User not found" });

// //     // Find or create courseProgress entry
// //     const progressIdx = user.courseProgress.findIndex(
// //       (p) => p.course?.toString() === courseId
// //     );

// //     if (progressIdx === -1) {
// //       return res.status(400).json({ message: "Not enrolled in this course" });
// //     }

// //     const progress = user.courseProgress[progressIdx];

// //     // Avoid duplicate completions
// //     const alreadyDone = progress.completedLessons?.some(
// //       (l) => l.toString() === lessonId
// //     );

// //     if (!alreadyDone) {
// //       user.courseProgress[progressIdx].completedLessons =
// //         [...(progress.completedLessons || []), lessonId];
// //     }

// //     // Update lastAccessedLesson
// //     user.courseProgress[progressIdx].lastAccessedLesson = lessonId;

// //     // Recalculate progress %
// //     const course = await Course.findById(courseId);
// //     if (course?.totalLessons > 0) {
// //       const completed = user.courseProgress[progressIdx].completedLessons.length;
// //       const percent = Math.round((completed / course.totalLessons) * 100);
// //       user.courseProgress[progressIdx].progressPercent = percent;
// //       user.courseProgress[progressIdx].status =
// //         percent === 100 ? "completed" : "continue";
// //     }

// //     await user.save();

// //     return res.status(200).json({
// //       success: true,
// //       progressPercent: user.courseProgress[progressIdx].progressPercent,
// //       status: user.courseProgress[progressIdx].status,
// //     });

// //   } catch (error) {
// //     return res.status(500).json({ message: error.message });
// //   }
// // };

// // // ─── ALL EXISTING CONTROLLERS BELOW (unchanged) ──────────────────────────────

// // export const getAllCourses = async (req, res) => {
// //   try {
// //     const {
// //       category, published, minPrice, maxPrice, search,
// //       sort = "createdAt", order = "desc",
// //     } = req.query;

// //     const matchStage = {};
// //     if (category) matchStage.category = category;
// //     if (published !== undefined && published !== "") matchStage.published = published === "true";
// //     if (minPrice || maxPrice) {
// //       matchStage.price = {};
// //       if (minPrice) matchStage.price.$gte = Number(minPrice);
// //       if (maxPrice) matchStage.price.$lte = Number(maxPrice);
// //     }
// //     if (search) {
// //       matchStage.$or = [
// //         { title: { $regex: search, $options: "i" } },
// //         { description: { $regex: search, $options: "i" } },
// //       ];
// //     }

// //     const pipeline = [
// //       ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
// //       {
// //         $lookup: { from: "users", localField: "instructor", foreignField: "_id", as: "instructorData" },
// //       },
// //       { $unwind: { path: "$instructorData", preserveNullAndEmptyArrays: true } },
// //       {
// //         $addFields: {
// //           enrollmentCount: { $size: { $ifNull: ["$studentsEnrolled", []] } },
// //           instructor: {
// //             _id: "$instructorData._id",
// //             name: "$instructorData.name",
// //             email: "$instructorData.email",
// //             pic: "$instructorData.pic",
// //           },
// //         },
// //       },
// //       { $project: { instructorData: 0, studentsEnrolled: 0 } },
// //       { $sort: { [sort]: order === "desc" ? -1 : 1 } },
// //     ];

// //     const courses = await Course.aggregate(pipeline);
// //     return res.status(200).json({ success: true, courses, total: courses.length });

// //   } catch (error) {
// //     return res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };

// // export const getCourseById = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return res.status(400).json({ message: "Invalid course ID" });
// //     }
// //     const course = await Course.findById(id).populate("instructor", "name email pic");
// //     if (!course) return res.status(404).json({ message: "Course not found" });
// //     return res.status(200).json({ success: true, course });
// //   } catch (error) {
// //     return res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };

// // export const updateCourse = async (req, res) => {
// //   try {
// //     const { courseId, status } = req.body;
// //     const userId = getInstructorId(req);
// //     const user = await User.findById(userId);
// //     if (!user) return res.status(404).json({ success: false, message: "User not found" });

// //     const progressIndex = user.courseProgress.findIndex(
// //       (p) => p.course.toString() === courseId
// //     );

// //     if (progressIndex !== -1) {
// //       user.courseProgress[progressIndex].status = status;
// //     } else {
// //       user.courseProgress.push({ course: courseId, status });
// //     }

// //     await user.save();
// //     return res.status(200).json({ success: true, message: "Course status updated" });
// //   } catch (error) {
// //     return res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // export const deleteCourse = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return res.status(400).json({ message: "Invalid course ID" });
// //     }
// //     const course = await Course.findById(id);
// //     if (!course) return res.status(404).json({ message: "Course not found" });

// //     const isInstructor = course.instructor.toString() === req.user.id;
// //     if (!isInstructor) return res.status(403).json({ message: "You can only delete your own courses" });

// //     if (course.studentsEnrolled?.length > 0) {
// //       return res.status(400).json({ message: "Cannot delete course with enrolled students" });
// //     }

// //     // Delete chapters and lessons too
// //     await Promise.all([
// //       Course.findByIdAndDelete(id),
// //       Chapter.deleteMany({ course: id }),
// //       Lesson.deleteMany({ course: id }),
// //     ]);

// //     return res.status(200).json({ message: "Course deleted successfully" });
// //   } catch (error) {
// //     return res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };

// // export const toggleCoursePublish = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const course = await Course.findById(id);
// //     if (!course) return res.status(404).json({ message: "Course not found" });

// //     if (course.instructor.toString() !== req.user.id) {
// //       return res.status(403).json({ message: "Unauthorized" });
// //     }

// //     // Check has lessons before publishing
// //     if (!course.published && course.totalLessons === 0) {
// //       return res.status(400).json({ message: "Cannot publish course without lessons" });
// //     }

// //     course.published = !course.published;
// //     await course.save();
// //     await course.populate("instructor", "name email pic");

// //     return res.status(200).json({
// //       message: `Course ${course.published ? "published" : "unpublished"} successfully`,
// //       course,
// //     });
// //   } catch (error) {
// //     return res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };

// // export const getCoursesByInstructor = async (req, res) => {
// //   try {
// //     const instructorId = getInstructorId(req);
// //     const courses = await Course.find({ instructor: instructorId })
// //       .populate("instructor", "name email pic")
// //       .sort({ createdAt: -1 });
// //     return res.status(200).json({ success: true, courses, length: courses.length });
// //   } catch (error) {
// //     return res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };

// // export const getInstdashboarddata = async (req, res) => {
// //   try {
// //     const instructorId = getInstructorId(req);

// //     // Single aggregation instead of multiple queries
// //     const [stats] = await Course.aggregate([
// //       { $match: { instructor: new mongoose.Types.ObjectId(instructorId) } },
// //       {
// //         $group: {
// //           _id: null,
// //           totalCourses: { $sum: 1 },
// //           totalStudents: { $sum: { $size: "$studentsEnrolled" } },
// //           totalRevenue: {
// //             $sum: {
// //               $multiply: ["$price", { $size: "$studentsEnrolled" }]
// //             }
// //           },
// //         },
// //       },
// //     ]);

// //     const assignments = await Assignment.countDocuments({ instructor: instructorId });

// //     return res.status(200).json({
// //       success: true,
// //       data: {
// //         totalCourses: stats?.totalCourses || 0,
// //         totalStudents: stats?.totalStudents || 0,
// //         totalRevenue: stats?.totalRevenue || 0,   // ← now REAL revenue
// //         totalAssignments: assignments,
// //       },
// //     });
// //   } catch (error) {
// //     return res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // export const addMyCourses = async (req, res) => {
// //   try {
// //     const { courseId } = req.body;
// //     const userId = getInstructorId(req);

// //     const [user, course] = await Promise.all([
// //       User.findById(userId),
// //       Course.findById(courseId),
// //     ]);

// //     if (!user) return res.status(400).json({ success: false, message: "User not found" });
// //     if (!course) return res.status(404).json({ success: false, message: "Course not found" });

// //     if (user.coursesenrolled.includes(courseId)) {
// //       return res.status(400).json({ success: false, message: "Already enrolled" });
// //     }

// //     user.coursesenrolled.push(courseId);
// //     await user.save();

// //     return res.status(200).json({ success: true, message: "Enrolled successfully" });
// //   } catch (error) {
// //     return res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // export const getMyCourses = async (req, res) => {
// //   try {
// //     const userId = getInstructorId(req);
// //     const user = await User.findById(userId)
// //       .populate("coursesenrolled", "title description price category thumbnail")
// //       .populate("courseProgress.course", "title totalLessons");

// //     if (!user) return res.status(400).json({ success: false, message: "User not found" });

// //     const coursesWithProgress = user.coursesenrolled.map((course) => {
// //       const progress = user.courseProgress.find(
// //         (p) => p.course?._id?.toString() === course._id.toString()
// //       );
// //       return {
// //         ...course.toObject(),
// //         progressStatus: progress?.status || "not started",
// //         progressPercent: progress?.progressPercent || 0,
// //         lastAccessedLesson: progress?.lastAccessedLesson || null,
// //       };
// //     });

// //     return res.status(200).json({ success: true, mycourses: coursesWithProgress });
// //   } catch (error) {
// //     return res.status(500).json({ success: false, message: error.message });
// //   }
// // };



// import mongoose from "mongoose";
// import Course from "../models/Course.js";
// import Chapter from "../models/Chapter.js";
// import Lesson from "../models/Lesson.js";
// import User from "../models/User.js";
// import Notification from "../models/Notification.js";
// import Assignment from "../models/Assignment.js";

// // ─────────────────────────────────────────────────────────────────────────────
// // CREATE COURSE  POST /api/course/create
// // Body: { title, description, price, category, level, thumbnail, published, chapters }
// // ─────────────────────────────────────────────────────────────────────────────
// // export const createCourse = async (req, res) => {
// //   const session = await mongoose.startSession();
// //   session.startTransaction();

// //   try {
// //     const instructorId = req.user._id;
// //     const {
// //       title, description, price, category,
// //       level = "beginner", thumbnail, published = false,
// //       chapters = []
// //     } = req.body;

// //     // Validation
// //     if (!title || !description || price === undefined || !category || !thumbnail) {
// //       await session.abortTransaction();
// //       return res.status(400).json({ success: false, message: "Missing required fields: title, description, price, category, thumbnail" });
// //     }

// //     const parsedPrice = parseFloat(price);
// //     if (isNaN(parsedPrice) || parsedPrice < 0) {
// //       await session.abortTransaction();
// //       return res.status(400).json({ success: false, message: "Price must be a valid positive number" });
// //     }

// //     if (!chapters.length) {
// //       await session.abortTransaction();
// //       return res.status(400).json({ success: false, message: "At least one chapter is required" });
// //     }

// //     const hasLessons = chapters.some(ch => ch.lessons?.length > 0);
// //     if (!hasLessons) {
// //       await session.abortTransaction();
// //       return res.status(400).json({ success: false, message: "At least one chapter must have lessons" });
// //     }

// //     const totalLessons = chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0);

// //     // Step 1: Create Course
// //     const [newCourse] = await Course.create([{
// //       title: title.trim(),
// //       description: description.trim(),
// //       price: parsedPrice,
// //       category,
// //       level,
// //       thumbnail,
// //       instructor: instructorId,
// //       published,
// //       studentsEnrolled: [],
// //       totalChapters: chapters.length,
// //       totalLessons,
// //     }], { session });

// //     // Step 2: Create Chapters + Lessons
// //     let totalDuration = 0;

// //     for (let ci = 0; ci < chapters.length; ci++) {
// //       const chData = chapters[ci];

// //       if (!chData.title?.trim()) {
// //         throw new Error(`Chapter ${ci + 1} must have a title`);
// //       }

// //       const [newChapter] = await Chapter.create([{
// //         title: chData.title.trim(),
// //         description: chData.description?.trim() || "",
// //         course: newCourse._id,
// //         order: ci + 1,
// //         isPublished: published,
// //       }], { session });

// //       const lessons = chData.lessons || [];

// //       for (let li = 0; li < lessons.length; li++) {
// //         const l = lessons[li];

// //         if (!l.title?.trim() || !l.videoUrl) {
// //           throw new Error(`Lesson ${li + 1} in Chapter ${ci + 1} must have a title and video`);
// //         }

// //         totalDuration += l.duration || 0;

// //         await Lesson.create([{
// //           title: l.title.trim(),
// //           description: l.description?.trim() || "",
// //           videoUrl: l.videoUrl,
// //           duration: l.duration || 0,
// //           thumbnail: l.thumbnail || "",
// //           isFree: l.isFree || false,
// //           order: li + 1,
// //           chapter: newChapter._id,
// //           course: newCourse._id,
// //         }], { session });
// //       }
// //     }

// //     // Step 3: Update totalDuration on course
// //     await Course.findByIdAndUpdate(newCourse._id, { totalDuration }, { session });

// //     // Commit everything
// //     await session.commitTransaction();

// //     // Step 4: Notification (after commit — failure here won't rollback course)
// //     try {
// //       await Notification.create({
// //         recipient: instructorId,
// //         course: newCourse._id,
// //         message: `Your course "${newCourse.title}" was ${published ? "published" : "saved as draft"} successfully`,
// //       });
// //     } catch (notifErr) {
// //       console.warn("Notification failed (non-critical):", notifErr.message);
// //     }

// //     // Step 5: Socket event if published
// //     if (published && req.io) {
// //       req.io.emit("newCoursePublished", {
// //         courseId: newCourse._id,
// //         title: newCourse.title,
// //         category: newCourse.category,
// //       });
// //     }

// //     return res.status(201).json({
// //       success: true,
// //       message: published ? "Course published successfully!" : "Course saved as draft",
// //       course: {
// //         id: newCourse._id,
// //         title: newCourse.title,
// //         totalChapters: chapters.length,
// //         totalLessons,
// //         published,
// //       },
// //     });

// //   } catch (error) {
// //     await session.abortTransaction();
// //     console.error("Create course error:", error.message);
// //     return res.status(500).json({ success: false, message: error.message });
// //   } finally {
// //     session.endSession();
// //   }
// // };
// // courseController.js — createCourse without transaction
// export const createCourse = async (req, res) => {
//   try {
//     const instructorId = req.user._id;
//     const { title, description, price, category, level = "beginner", thumbnail, published = false, chapters = [] } = req.body;

//     // Validation
//     if (!title || !description || price === undefined || !category || !thumbnail) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }
//     const parsedPrice = parseFloat(price);
//     if (isNaN(parsedPrice) || parsedPrice < 0) {
//       return res.status(400).json({ success: false, message: "Invalid price" });
//     }
//     if (!chapters.length) {
//       return res.status(400).json({ success: false, message: "At least one chapter required" });
//     }

//     const totalLessons = chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0);

//     // No session — plain creates
//     const newCourse = await Course.create({
//       title: title.trim(),
//       description: description.trim(),
//       price: parsedPrice,
//       category,
//       level,
//       thumbnail,
//       instructor: instructorId,
//       published,
//       studentsEnrolled: [],
//       totalChapters: chapters.length,
//       totalLessons,
//     });

//     let totalDuration = 0;

//     for (let ci = 0; ci < chapters.length; ci++) {
//       const chData = chapters[ci];
//       if (!chData.title?.trim()) throw new Error(`Chapter ${ci + 1} needs a title`);

//       const newChapter = await Chapter.create({
//         title: chData.title.trim(),
//         description: chData.description?.trim() || "",
//         course: newCourse._id,
//         order: ci + 1,
//         isPublished: published,
//       });

//       for (let li = 0; li < (chData.lessons || []).length; li++) {
//         const l = chData.lessons[li];
//         if (!l.title?.trim() || !l.videoUrl) throw new Error(`Lesson ${li + 1} in Chapter ${ci + 1} needs title and video`);

//         totalDuration += l.duration || 0;

//         await Lesson.create({
//           title: l.title.trim(),
//           description: l.description?.trim() || "",
//           videoUrl: l.videoUrl,
//           duration: l.duration || 0,
//           thumbnail: l.thumbnail || "",
//           isFree: l.isFree || false,
//           order: li + 1,
//           chapter: newChapter._id,
//           course: newCourse._id,
//         });
//       }
//     }

//     await Course.findByIdAndUpdate(newCourse._id, { totalDuration });

//     // Notification
//     try {
//       await Notification.create({
//         recipient: instructorId,
//         course: newCourse._id,
//         message: `Your course "${newCourse.title}" was ${published ? "published" : "saved as draft"}`,
//       });
//     } catch (e) {
//       console.warn("Notification failed:", e.message);
//     }

//     if (published && req.io) {
//       req.io.emit("newCoursePublished", { courseId: newCourse._id, title: newCourse.title });
//     }

//     return res.status(201).json({
//       success: true,
//       message: published ? "Course published!" : "Course saved as draft",
//       course: { id: newCourse._id, title: newCourse.title, totalChapters: chapters.length, totalLessons, published },
//     });

//   } catch (error) {
//     console.error("Create course error:", error.message);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // addMyCourses without transaction
// export const addMyCourses = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { courseId } = req.body;

//     const [user, course] = await Promise.all([
//       User.findById(userId),
//       Course.findById(courseId),
//     ]);

//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     if (!course) return res.status(404).json({ success: false, message: "Course not found" });
//     if (!course.published) return res.status(400).json({ success: false, message: "Course not available" });

//     const alreadyEnrolled = user.coursesenrolled?.some(c => c.toString() === courseId);
//     if (alreadyEnrolled) return res.status(400).json({ success: false, message: "Already enrolled" });

//     // Two separate updates — no transaction
//     await User.findByIdAndUpdate(userId, {
//       $push: {
//         coursesenrolled: courseId,
//         courseProgress: { course: courseId, status: "not started", completedLessons: [], progressPercent: 0 },
//       },
//     });

//     await Course.findByIdAndUpdate(courseId, { $addToSet: { studentsEnrolled: userId } });

//     try {
//       await Notification.create({
//         recipient: course.instructor,
//         course: courseId,
//         message: `${user.name} enrolled in "${course.title}"`,
//       });
//     } catch (e) {
//       console.warn("Notification failed:", e.message);
//     }

//     return res.status(200).json({ success: true, message: "Enrolled successfully" });

//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // GET ALL COURSES  GET /api/course
// // Query: category, published, minPrice, maxPrice, search, sort, order
// // ─────────────────────────────────────────────────────────────────────────────
// export const getAllCourses = async (req, res) => {
//   try {
//     const {
//       category, published, minPrice, maxPrice, search,
//       sort = "createdAt", order = "desc",
//     } = req.query;

//     const matchStage = {};
//     if (category) matchStage.category = category;
//     if (published !== undefined && published !== "") {
//       matchStage.published = published === "true";
//     }
//     if (minPrice || maxPrice) {
//       matchStage.price = {};
//       if (minPrice) matchStage.price.$gte = Number(minPrice);
//       if (maxPrice) matchStage.price.$lte = Number(maxPrice);
//     }
//     if (search) {
//       matchStage.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//       ];
//     }

//     const pipeline = [
//       ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
//       {
//         $lookup: {
//           from: "users",
//           localField: "instructor",
//           foreignField: "_id",
//           as: "instructorData",
//         },
//       },
//       { $unwind: { path: "$instructorData", preserveNullAndEmptyArrays: true } },
//       {
//         $addFields: {
//           enrollmentCount: { $size: { $ifNull: ["$studentsEnrolled", []] } },
//           instructor: {
//             _id: "$instructorData._id",
//             name: "$instructorData.name",
//             email: "$instructorData.email",
//             pic: "$instructorData.pic",
//           },
//         },
//       },
//       { $project: { instructorData: 0, studentsEnrolled: 0 } },
//       { $sort: { [sort]: order === "desc" ? -1 : 1 } },
//     ];

//     const courses = await Course.aggregate(pipeline);

//     return res.status(200).json({ success: true, courses, total: courses.length });

//   } catch (error) {
//     console.error("Get all courses error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // GET COURSE BY ID  GET /api/course/:id
// // ─────────────────────────────────────────────────────────────────────────────
// export const getCourseById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid course ID" });
//     }

//     const course = await Course.findById(id).populate("instructor", "name email pic");
//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }

//     return res.status(200).json({ success: true, course });

//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // GET FULL CURRICULUM  GET /api/course/:id/curriculum
// // Returns Course + Chapters + Lessons nested — used on course detail page
// // ─────────────────────────────────────────────────────────────────────────────
// export const getCourseCurriculum = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid course ID" });
//     }

//     // Parallel fetch — faster than sequential awaits
//     const [course, chapters, allLessons] = await Promise.all([
//       Course.findById(id).populate("instructor", "name email pic"),
//       Chapter.find({ course: id }).sort({ order: 1 }),
//       Lesson.find({ course: id }).sort({ order: 1 }),
//     ]);

//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }

//     // Group lessons under their chapters in memory (one query instead of N)
//     const curriculum = chapters.map((ch) => ({
//       _id: ch._id,
//       title: ch.title,
//       description: ch.description,
//       order: ch.order,
//       isPublished: ch.isPublished,
//       lessons: allLessons
//         .filter((l) => l.chapter.toString() === ch._id.toString())
//         .map((l) => ({
//           _id: l._id,
//           title: l.title,
//           description: l.description,
//           duration: l.duration,
//           isFree: l.isFree,
//           order: l.order,
//           thumbnail: l.thumbnail,
//           // Only expose videoUrl for free lessons here
//           // Paid lesson videos go through /lesson/:id/video (auth protected)
//           videoUrl: l.isFree ? l.videoUrl : undefined,
//         })),
//     }));

//     return res.status(200).json({
//       success: true,
//       course: {
//         _id: course._id,
//         title: course.title,
//         description: course.description,
//         price: course.price,
//         category: course.category,
//         level: course.level,
//         thumbnail: course.thumbnail,
//         instructor: course.instructor,
//         published: course.published,
//         totalChapters: course.totalChapters,
//         totalLessons: course.totalLessons,
//         totalDuration: course.totalDuration,
//         enrollmentCount: course.studentsEnrolled.length,
//         rating: course.rating,
//       },
//       curriculum,
//     });

//   } catch (error) {
//     console.error("Get curriculum error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // GET LESSON VIDEO  GET /api/course/:courseId/lesson/:lessonId/video
// // Free lessons: anyone logged in. Paid lessons: enrolled students + instructor only.
// // ─────────────────────────────────────────────────────────────────────────────
// export const getLessonVideo = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { courseId, lessonId } = req.params;

//     const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
//     if (!lesson) {
//       return res.status(404).json({ success: false, message: "Lesson not found" });
//     }

//     // Free lesson — any logged-in user can watch
//     if (lesson.isFree) {
//       return res.status(200).json({ success: true, videoUrl: lesson.videoUrl });
//     }

//     // Paid lesson — check if enrolled or is instructor
//     const [user, course] = await Promise.all([
//       User.findById(userId),
//       Course.findById(courseId),
//     ]);

//     const isEnrolled = user?.coursesenrolled?.some((c) => c.toString() === courseId);
//     const isInstructor = course?.instructor.toString() === userId.toString();

//     if (!isEnrolled && !isInstructor) {
//       return res.status(403).json({
//         success: false,
//         message: "Please enroll in this course to watch this lesson",
//       });
//     }

//     return res.status(200).json({ success: true, videoUrl: lesson.videoUrl });

//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // MARK LESSON COMPLETE  PATCH /api/course/:courseId/lesson/:lessonId/complete
// // ─────────────────────────────────────────────────────────────────────────────
// export const markLessonComplete = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { courseId, lessonId } = req.params;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     const progressIdx = user.courseProgress.findIndex(
//       (p) => p.course?.toString() === courseId
//     );

//     if (progressIdx === -1) {
//       return res.status(400).json({ success: false, message: "You are not enrolled in this course" });
//     }

//     const progress = user.courseProgress[progressIdx];

//     // Avoid duplicate
//     const alreadyDone = progress.completedLessons?.some(
//       (l) => l.toString() === lessonId
//     );

//     if (!alreadyDone) {
//       user.courseProgress[progressIdx].completedLessons = [
//         ...(progress.completedLessons || []),
//         lessonId,
//       ];
//     }

//     // Update last accessed
//     user.courseProgress[progressIdx].lastAccessedLesson = lessonId;

//     // Recalculate percentage
//     const course = await Course.findById(courseId);
//     if (course?.totalLessons > 0) {
//       const completed = user.courseProgress[progressIdx].completedLessons.length;
//       const percent = Math.round((completed / course.totalLessons) * 100);
//       user.courseProgress[progressIdx].progressPercent = percent;
//       user.courseProgress[progressIdx].status =
//         percent === 100 ? "completed" : "continue";
//     }

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       progressPercent: user.courseProgress[progressIdx].progressPercent,
//       status: user.courseProgress[progressIdx].status,
//     });

//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // UPDATE COURSE PROGRESS  PUT /api/course/stsupdate
// // Body: { courseId, status }
// // ─────────────────────────────────────────────────────────────────────────────
// export const updateCourse = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { courseId, status } = req.body;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     const progressIndex = user.courseProgress.findIndex(
//       (p) => p.course?.toString() === courseId
//     );

//     if (progressIndex !== -1) {
//       user.courseProgress[progressIndex].status = status;
//     } else {
//       user.courseProgress.push({ course: courseId, status });
//     }

//     await user.save();
//     return res.status(200).json({ success: true, message: "Course status updated" });

//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // DELETE COURSE  DELETE /api/course/:id
// // ─────────────────────────────────────────────────────────────────────────────
// export const deleteCourse = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid course ID" });
//     }

//     const course = await Course.findById(id);
//     if (!course) return res.status(404).json({ success: false, message: "Course not found" });

//     if (course.instructor.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ success: false, message: "You can only delete your own courses" });
//     }

//     if (course.studentsEnrolled?.length > 0) {
//       return res.status(400).json({ success: false, message: "Cannot delete a course with enrolled students" });
//     }

//     // Delete course + all its chapters + all its lessons in parallel
//     await Promise.all([
//       Course.findByIdAndDelete(id),
//       Chapter.deleteMany({ course: id }),
//       Lesson.deleteMany({ course: id }),
//     ]);

//     return res.status(200).json({ success: true, message: "Course deleted successfully" });

//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // TOGGLE PUBLISH  PATCH /api/course/:id/publish
// // ─────────────────────────────────────────────────────────────────────────────
// export const toggleCoursePublish = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid course ID" });
//     }

//     const course = await Course.findById(id);
//     if (!course) return res.status(404).json({ success: false, message: "Course not found" });

//     if (course.instructor.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }

//     if (!course.published && course.totalLessons === 0) {
//       return res.status(400).json({ success: false, message: "Cannot publish a course without lessons" });
//     }

//     course.published = !course.published;
//     await course.save();
//     await course.populate("instructor", "name email pic");

//     return res.status(200).json({
//       success: true,
//       message: `Course ${course.published ? "published" : "unpublished"} successfully`,
//       course,
//     });

//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // GET INSTRUCTOR'S COURSES  GET /api/course/instructor/courses
// // ─────────────────────────────────────────────────────────────────────────────
// export const getCoursesByInstructor = async (req, res) => {
//   try {
//     const instructorId = req.user._id;

//     const courses = await Course.find({ instructor: instructorId })
//       .populate("instructor", "name email pic")
//       .sort({ createdAt: -1 });

//     return res.status(200).json({ success: true, courses, total: courses.length });

//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // INSTRUCTOR DASHBOARD STATS  GET /api/course/instructor/dashboard
// // Uses aggregation — single DB call for all stats
// // ─────────────────────────────────────────────────────────────────────────────
// export const getInstdashboarddata = async (req, res) => {
//   try {
//     const instructorId = req.user._id;

//     // Single aggregation pipeline instead of multiple queries
//     const [stats] = await Course.aggregate([
//       { $match: { instructor: new mongoose.Types.ObjectId(instructorId) } },
//       {
//         $group: {
//           _id: null,
//           totalCourses: { $sum: 1 },
//           totalStudents: { $sum: { $size: { $ifNull: ["$studentsEnrolled", []] } } },
//           totalRevenue: {
//             $sum: {
//               $multiply: ["$price", { $size: { $ifNull: ["$studentsEnrolled", []] } }],
//             },
//           },
//           publishedCourses: {
//             $sum: { $cond: [{ $eq: ["$published", true] }, 1, 0] },
//           },
//         },
//       },
//     ]);

//     // Count assignments separately
//     const totalAssignments = await Assignment.countDocuments({ instructor: instructorId });

//     // Count active quizzes (published ones by this instructor)
//     // Uncomment if you import Quiz model
//     // const activeQuizzes = await Quiz.countDocuments({ instructor: instructorId, isPublished: true });

//     return res.status(200).json({
//       success: true,
//       data: {
//         totalCourses: stats?.totalCourses || 0,
//         totalStudents: stats?.totalStudents || 0,
//         totalRevenue: stats?.totalRevenue || 0,
//         publishedCourses: stats?.publishedCourses || 0,
//         totalAssignments,
//       },
//     });

//   } catch (error) {
//     console.error("Dashboard error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // ENROLL IN COURSE  POST /api/course/addmycourse
// // Body: { courseId }
// // ─────────────────────────────────────────────────────────────────────────────
// export const addMyCourses = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const userId = req.user._id;
//     const { courseId } = req.body;

//     const [user, course] = await Promise.all([
//       User.findById(userId),
//       Course.findById(courseId),
//     ]);

//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     if (!course) return res.status(404).json({ success: false, message: "Course not found" });
//     if (!course.published) return res.status(400).json({ success: false, message: "Course is not available" });

//     // Check already enrolled
//     const alreadyEnrolled = user.coursesenrolled?.some(
//       (c) => c.toString() === courseId
//     );
//     if (alreadyEnrolled) {
//       return res.status(400).json({ success: false, message: "Already enrolled in this course" });
//     }

//     // Atomic: update both user + course enrollment count
//     await User.findByIdAndUpdate(
//       userId,
//       {
//         $push: {
//           coursesenrolled: courseId,
//           courseProgress: {
//             course: courseId,
//             status: "not started",
//             completedLessons: [],
//             progressPercent: 0,
//           },
//         },
//       },
//       { session }
//     );

//     await Course.findByIdAndUpdate(
//       courseId,
//       { $addToSet: { studentsEnrolled: userId } },
//       { session }
//     );

//     await session.commitTransaction();

//     // Notify instructor
//     try {
//       await Notification.create({
//         recipient: course.instructor,
//         course: courseId,
//         message: `${user.name} enrolled in "${course.title}"`,
//       });
//     } catch (e) {
//       console.warn("Enrollment notification failed:", e.message);
//     }

//     return res.status(200).json({ success: true, message: "Enrolled successfully" });

//   } catch (error) {
//     await session.abortTransaction();
//     return res.status(500).json({ success: false, message: error.message });
//   } finally {
//     session.endSession();
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // GET MY ENROLLED COURSES  GET /api/course/mycourses
// // ─────────────────────────────────────────────────────────────────────────────
// export const getMyCourses = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const user = await User.findById(userId)
//       .populate("coursesenrolled", "title description price category thumbnail totalLessons totalDuration")
//       .populate("courseProgress.course", "title totalLessons");

//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     const coursesWithProgress = user.coursesenrolled.map((course) => {
//       const progress = user.courseProgress.find(
//         (p) => p.course?._id?.toString() === course._id.toString()
//       );
//       return {
//         ...course.toObject(),
//         progressStatus: progress?.status || "not started",
//         progressPercent: progress?.progressPercent || 0,
//         completedLessons: progress?.completedLessons?.length || 0,
//         lastAccessedLesson: progress?.lastAccessedLesson || null,
//       };
//     });

//     return res.status(200).json({ success: true, mycourses: coursesWithProgress });

//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };



import mongoose from "mongoose";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import Lesson from "../models/Lesson.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Assignment from "../models/Assignment.js";

// ─────────────────────────────────────────────────────────────────────────────
// CREATE COURSE  POST /api/course/create
// ─────────────────────────────────────────────────────────────────────────────
export const createCourse = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const {
      title, description, price, category,
      level = "beginner", thumbnail, published = false,
      chapters = []
    } = req.body;

    if (!title || !description || price === undefined || !category || !thumbnail) {
      return res.status(400).json({ success: false, message: "Missing required fields: title, description, price, category, thumbnail" });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ success: false, message: "Invalid price" });
    }

    if (!chapters.length) {
      return res.status(400).json({ success: false, message: "At least one chapter required" });
    }

    const totalLessons = chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0);

    // Step 1: Create Course
    const newCourse = await Course.create({
      title: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      category,
      level,
      thumbnail,
      instructor: instructorId,
      published,
      studentsEnrolled: [],
      totalChapters: chapters.length,
      totalLessons,
    });

    // Step 2: Create Chapters + Lessons
    let totalDuration = 0;

    for (let ci = 0; ci < chapters.length; ci++) {
      const chData = chapters[ci];
      if (!chData.title?.trim()) throw new Error(`Chapter ${ci + 1} needs a title`);

      const newChapter = await Chapter.create({
        title: chData.title.trim(),
        description: chData.description?.trim() || "",
        course: newCourse._id,
        order: ci + 1,
        isPublished: published,
      });

      for (let li = 0; li < (chData.lessons || []).length; li++) {
        const l = chData.lessons[li];
        if (!l.title?.trim() || !l.videoUrl) {
          throw new Error(`Lesson ${li + 1} in Chapter ${ci + 1} needs a title and video`);
        }

        totalDuration += l.duration || 0;

        await Lesson.create({
          title: l.title.trim(),
          description: l.description?.trim() || "",
          videoUrl: l.videoUrl,
          duration: l.duration || 0,
          thumbnail: l.thumbnail || "",
          isFree: l.isFree || false,
          order: li + 1,
          chapter: newChapter._id,
          course: newCourse._id,
        });
      }
    }

    // Step 3: Update totalDuration
    await Course.findByIdAndUpdate(newCourse._id, { totalDuration });

    // Step 4: Notification (non-critical)
    try {
      await Notification.create({
        recipient: instructorId,
        course: newCourse._id,
        message: `Your course "${newCourse.title}" was ${published ? "published" : "saved as draft"}`,
      });
    } catch (e) {
      console.warn("Notification failed:", e.message);
    }

    // Step 5: Socket event
    if (published && req.io) {
      req.io.emit("newCoursePublished", {
        courseId: newCourse._id,
        title: newCourse.title,
        category: newCourse.category,
      });
    }

    return res.status(201).json({
      success: true,
      message: published ? "Course published!" : "Course saved as draft",
      course: {
        id: newCourse._id,
        title: newCourse.title,
        totalChapters: chapters.length,
        totalLessons,
        published,
      },
    });

  } catch (error) {
    console.error("Create course error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL COURSES  GET /api/course
// Query: category, published, minPrice, maxPrice, search, sort, order
// ─────────────────────────────────────────────────────────────────────────────
export const getAllCourses = async (req, res) => {
  try {
    const {
      category, published, minPrice, maxPrice, search,
      sort = "createdAt", order = "desc",
    } = req.query;

    const matchStage = {};
    if (category) matchStage.category = category;
    if (published !== undefined && published !== "") {
      matchStage.published = published === "true";
    }
    if (minPrice || maxPrice) {
      matchStage.price = {};
      if (minPrice) matchStage.price.$gte = Number(minPrice);
      if (maxPrice) matchStage.price.$lte = Number(maxPrice);
    }
    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pipeline = [
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: "users",
          localField: "instructor",
          foreignField: "_id",
          as: "instructorData",
        },
      },
      { $unwind: { path: "$instructorData", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          enrollmentCount: { $size: { $ifNull: ["$studentsEnrolled", []] } },
          instructor: {
            _id: "$instructorData._id",
            name: "$instructorData.name",
            email: "$instructorData.email",
            pic: "$instructorData.pic",
          },
        },
      },
      { $project: { instructorData: 0, studentsEnrolled: 0 } },
      { $sort: { [sort]: order === "desc" ? -1 : 1 } },
    ];

    const courses = await Course.aggregate(pipeline);
    return res.status(200).json({ success: true, courses, total: courses.length });

  } catch (error) {
    console.error("Get all courses error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET COURSE BY ID  GET /api/course/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(id).populate("instructor", "name email pic");
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    return res.status(200).json({ success: true, course });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET FULL CURRICULUM  GET /api/course/:id/curriculum
// Returns: Course info + chapters + lessons nested
// Used on: Course detail page, student learning page
// ─────────────────────────────────────────────────────────────────────────────
export const getCourseCurriculum = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    // 3 queries in parallel — faster than sequential
    const [course, chapters, allLessons] = await Promise.all([
      Course.findById(id).populate("instructor", "name email pic"),
      Chapter.find({ course: id }).sort({ order: 1 }),
      Lesson.find({ course: id }).sort({ order: 1 }),
    ]);

    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    // Group lessons under chapters in memory — one DB call not N
    const curriculum = chapters.map((ch) => ({
      _id: ch._id,
      title: ch.title,
      description: ch.description,
      order: ch.order,
      isPublished: ch.isPublished,
      lessons: allLessons
        .filter((l) => l.chapter.toString() === ch._id.toString())
        .map((l) => ({
          _id: l._id,
          title: l.title,
          description: l.description,
          duration: l.duration,
          isFree: l.isFree,
          order: l.order,
          thumbnail: l.thumbnail,
          // Free lessons: expose URL here
          // Paid lessons: URL only via /lesson/:id/video (auth + enrollment check)
          videoUrl: l.isFree ? l.videoUrl : undefined,
        })),
    }));

    return res.status(200).json({
      success: true,
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        category: course.category,
        level: course.level,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        published: course.published,
        totalChapters: course.totalChapters,
        totalLessons: course.totalLessons,
        totalDuration: course.totalDuration,
        enrollmentCount: course.studentsEnrolled.length,
        rating: course.rating,
      },
      curriculum,
    });

  } catch (error) {
    console.error("Get curriculum error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET LESSON VIDEO  GET /api/course/:courseId/lesson/:lessonId/video
// Free lessons → any logged-in user
// Paid lessons → enrolled students or instructor only
// ─────────────────────────────────────────────────────────────────────────────
export const getLessonVideo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, lessonId } = req.params;

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    // Free — give URL immediately
    if (lesson.isFree) {
      return res.status(200).json({ success: true, videoUrl: lesson.videoUrl });
    }

    // Paid — check enrollment or instructor
    const [user, course] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId),
    ]);

    const isEnrolled = user?.coursesenrolled?.some((c) => c.toString() === courseId);
    const isInstructor = course?.instructor.toString() === userId.toString();

    if (!isEnrolled && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: "Please enroll in this course to watch this lesson",
      });
    }

    return res.status(200).json({ success: true, videoUrl: lesson.videoUrl });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MARK LESSON COMPLETE  PATCH /api/course/:courseId/lesson/:lessonId/complete
// ─────────────────────────────────────────────────────────────────────────────
export const markLessonComplete = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, lessonId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const progressIdx = user.courseProgress.findIndex(
      (p) => p.course?.toString() === courseId
    );

    if (progressIdx === -1) {
      return res.status(400).json({ success: false, message: "Not enrolled in this course" });
    }

    const progress = user.courseProgress[progressIdx];

    // Prevent duplicate completions
    const alreadyDone = progress.completedLessons?.some(
      (l) => l.toString() === lessonId
    );

    if (!alreadyDone) {
      user.courseProgress[progressIdx].completedLessons = [
        ...(progress.completedLessons || []),
        lessonId,
      ];
    }

    user.courseProgress[progressIdx].lastAccessedLesson = lessonId;

    // Recalculate progress %
    const course = await Course.findById(courseId);
    if (course?.totalLessons > 0) {
      const completed = user.courseProgress[progressIdx].completedLessons.length;
      const percent = Math.round((completed / course.totalLessons) * 100);
      user.courseProgress[progressIdx].progressPercent = percent;
      user.courseProgress[progressIdx].status = percent === 100 ? "completed" : "continue";
    }

    await user.save();

    return res.status(200).json({
      success: true,
      progressPercent: user.courseProgress[progressIdx].progressPercent,
      status: user.courseProgress[progressIdx].status,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE COURSE PROGRESS STATUS  PUT /api/course/stsupdate
// Body: { courseId, status }
// ─────────────────────────────────────────────────────────────────────────────
export const updateCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, status } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const progressIndex = user.courseProgress.findIndex(
      (p) => p.course?.toString() === courseId
    );

    if (progressIndex !== -1) {
      user.courseProgress[progressIndex].status = status;
    } else {
      user.courseProgress.push({ course: courseId, status });
    }

    await user.save();
    return res.status(200).json({ success: true, message: "Course status updated" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE COURSE  DELETE /api/course/:id
// Also deletes all chapters and lessons belonging to it
// ─────────────────────────────────────────────────────────────────────────────
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete your own courses" });
    }

    if (course.studentsEnrolled?.length > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete a course with enrolled students" });
    }

    // Delete course + chapters + lessons together
    await Promise.all([
      Course.findByIdAndDelete(id),
      Chapter.deleteMany({ course: id }),
      Lesson.deleteMany({ course: id }),
    ]);

    return res.status(200).json({ success: true, message: "Course deleted successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE PUBLISH  PATCH /api/course/:id/publish
// ─────────────────────────────────────────────────────────────────────────────
export const toggleCoursePublish = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (!course.published && course.totalLessons === 0) {
      return res.status(400).json({ success: false, message: "Cannot publish a course without lessons" });
    }

    course.published = !course.published;
    await course.save();
    await course.populate("instructor", "name email pic");

    return res.status(200).json({
      success: true,
      message: `Course ${course.published ? "published" : "unpublished"} successfully`,
      course,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET INSTRUCTOR'S COURSES  GET /api/course/instructor/courses
// ─────────────────────────────────────────────────────────────────────────────
export const getCoursesByInstructor = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const courses = await Course.find({ instructor: instructorId })
      .populate("instructor", "name email pic")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, courses, total: courses.length });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR DASHBOARD STATS  GET /api/course/instructor/dashboard
// Single aggregation pipeline — replaces multiple separate queries
// ─────────────────────────────────────────────────────────────────────────────
export const getInstdashboarddata = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const [stats] = await Course.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId) } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalStudents: { $sum: { $size: { $ifNull: ["$studentsEnrolled", []] } } },
          totalRevenue: {
            $sum: {
              $multiply: ["$price", { $size: { $ifNull: ["$studentsEnrolled", []] } }],
            },
          },
          publishedCourses: {
            $sum: { $cond: [{ $eq: ["$published", true] }, 1, 0] },
          },
        },
      },
    ]);

    const totalAssignments = await Assignment.countDocuments({ instructor: instructorId });

    return res.status(200).json({
      success: true,
      data: {
        totalCourses: stats?.totalCourses || 0,
        totalStudents: stats?.totalStudents || 0,
        totalRevenue: stats?.totalRevenue || 0,
        publishedCourses: stats?.publishedCourses || 0,
        totalAssignments,
      },
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ENROLL IN COURSE  POST /api/course/addmycourse
// Body: { courseId }
// No transaction — standalone MongoDB doesn't support them
// When you move to Atlas or replica set, wrap in session/transaction
// ─────────────────────────────────────────────────────────────────────────────
export const addMyCourses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.body;

    const [user, course] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId),
    ]);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!course.published) return res.status(400).json({ success: false, message: "Course not available" });

    const alreadyEnrolled = user.coursesenrolled?.some(
      (c) => c.toString() === courseId
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: "Already enrolled" });
    }

    // Two separate writes (no transaction on standalone MongoDB)
    await User.findByIdAndUpdate(userId, {
      $push: {
        coursesenrolled: courseId,
        courseProgress: {
          course: courseId,
          status: "not started",
          completedLessons: [],
          progressPercent: 0,
        },
      },
    });

    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { studentsEnrolled: userId },
    });

    // Notify instructor (non-critical)
    try {
      await Notification.create({
        recipient: course.instructor,
        course: courseId,
        message: `${user.name} enrolled in "${course.title}"`,
      });
    } catch (e) {
      console.warn("Enrollment notification failed:", e.message);
    }

    return res.status(200).json({ success: true, message: "Enrolled successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET MY ENROLLED COURSES  GET /api/course/mycourses
// ─────────────────────────────────────────────────────────────────────────────
export const getMyCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("coursesenrolled", "title description price category thumbnail totalLessons totalDuration")
      .populate("courseProgress.course", "title totalLessons");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const coursesWithProgress = user.coursesenrolled.map((course) => {
      const progress = user.courseProgress.find(
        (p) => p.course?._id?.toString() === course._id.toString()
      );
      return {
        ...course.toObject(),
        progressStatus: progress?.status || "not started",
        progressPercent: progress?.progressPercent || 0,
        completedLessons: progress?.completedLessons?.length || 0,
        lastAccessedLesson: progress?.lastAccessedLesson || null,
      };
    });

    return res.status(200).json({ success: true, mycourses: coursesWithProgress });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};