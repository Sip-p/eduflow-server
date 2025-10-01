import mongoose from "mongoose";
import Course from "../models/Course.js";
import jwt from "jsonwebtoken";
// import Notification from '../models/'
import User from "../models/User.js";



// Get all courses with pagination and filtering
export const getAllCourses = async (req, res) => {
  try{
    const allcourses=await Course.find().populate('instructor','name email pic')
    if(!allcourses){
      res.status(200).json({success:false})
    }
    res.status(200).json({success:true,courses:allcourses})
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get course by ID with full details
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    const course=await Course.findById(id)
    console.log("Course found:",course)

    const courseInstructor = await Course.findById(id)
      .populate('instructor', 'name email pic ')
      

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // If user is not enrolled and course has lessons, hide video URLs
    // const isInstructor = req.user && req.user.id === course.instructor._id.toString();
    // const isEnrolled = req.user && course.studentsEnrolled.includes(req.user.id);
    
    // if (!isInstructor && !isEnrolled && course.lessons.length > 0) {
    //   // Hide video URLs for non-enrolled users
    //   course.lessons = course.lessons.map(lesson => ({
    //     ...lesson.toObject(),
    //     videoUrl: undefined
    //   }));
    // }

    res.status(200).json(course);
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Create a new course
// export const createCourse = async (req, res) => {
//   try {
//     const { 
//       title, 
//       description, 
//       price, 
//       category,
//       thumbnail,
//       lessons,
//       published = false 
//     } = req.body;
//     console.log('=== CREATE COURSE DEBUG ===');
//     console.log('Headers:', req.headers);
//     console.log('Body:', req.body);
//     console.log('Body type:', typeof req.body);
//     console.log('Body keys:', Object.keys(req.body || {}));
//     const instructorId = req.user.id; // From auth middleware

//     // Validation
//     if (!title || !description || !price) {
//       return res.status(400).json({ 
//         message: "Title, description, and price are required" 
//       });
//     }

//     if (price < 0) {
//       return res.status(400).json({ 
//         message: "Price must be a positive number" 
//       });
//     }

//     if (!category) {
//       return res.status(400).json({ 
//         message: "Category is required" 
//       });
//     }

//     if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
//       return res.status(400).json({ 
//         message: "At least one lesson is required" 
//       });
//     }

//     // Validate lessons
//     for (let i = 0; i < lessons.length; i++) {
//       const lesson = lessons[i];
//       if (!lesson.title || !lesson.videoUrl) {
//         return res.status(400).json({ 
//           message: `Lesson ${i + 1} must have title and video URL` 
//         });
//       }
//     }

//     // Create course
//     const newCourse = new Course({
//       title: title.trim(),
//       description: description.trim(),
//       price: parseFloat(price),
//       category: category.trim(),
//       instructor: instructorId,
//       thumbnail: thumbnail || '',
//       lessons: lessons.map((lesson, index) => ({
//         title: lesson.title.trim(),
//         description: lesson.description ? lesson.description.trim() : '',
//         videoUrl: lesson.videoUrl,
//         duration: lesson.duration || 0,
//         order: index + 1
//       })),
//       published: Boolean(published),
//       createdAt: new Date(),
//       updatedAt: new Date()
//     });

//     await newCourse.save();
    
//     // Populate instructor info before returning
//     await newCourse.populate('instructor', 'name email pic');

//     res.status(201).json({
//       message: "Course created successfully",
//       course: newCourse
//     });

//   } catch (error) {
//     console.error('Create course error:', error);
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       return res.status(400).json({ 
//         message: "A course with this title already exists" 
//       });
//     }
    
//     res.status(500).json({ 
//       message: "Server Error", 
//       error: error.message 
//     });
//   }
// };

//done****

export const createCourse = async (req, res) => {
  try {
   

    const { title, description, price, category, thumbnail, lessons, published = false } = req.body;

    // Check JWT in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const instructorId = decoded.id; // Use JWT ID

    // Validation
    if (!title || !description || !price || !category || !lessons || !Array.isArray(lessons) || lessons.length === 0) {
      return res.status(400).json({ message: "Missing required fields or lessons" });
    }

    if (isNaN(price) || price < 0) {
      return res.status(400).json({ message: "Price must be a valid positive number" });
    }

    // Validate each lesson
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      if (!lesson.title || !lesson.videoUrl) {
        return res.status(400).json({ message: `Lesson ${i + 1} must have title and video URL` });
      }
    }

    // Create course
    const newCourse = new Course({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category.trim(),
      instructor: instructorId,
      thumbnail: thumbnail || '',
      lessons: lessons.map((lesson, index) => ({
        title: lesson.title.trim(),
        description: lesson.description ? lesson.description.trim() : '',
        videoUrl: lesson.videoUrl,
        duration: lesson.duration || 0,
        order: index + 1
      })),
      published: Boolean(published),
      studentsEnrolled: [],
      studentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newCourse.save();

 
    res.status(201).json({
      message: "Course created successfully",
      course: {
        id: newCourse._id,
        title: newCourse.title,
        lessonsCount: newCourse.lessons.length,
        price: newCourse.price
      }
    });

  } catch (error) {
     res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update a course
// export const updateCourse = async (req, res) => {
//  try{
//   const courseId=req.body.courseId
//   const authorization=req.headers["authorization"]
//  const status=req.body.status
//  console.log("sts---",status)
//   const token=authorization.split(" ")[1]
//  if(!token){
//   return res.status(401).json({success:false,message:"Unauthorized"})
//  }
//  const decoded=jwt.verify(token,process.env.JWT_SECRET)
//  const user=await User.findById(decoded.id)
//  console.log(user.courseProgress)
// //  const targetCourse=user.courseProgress.course.findById(courseId)
// //  console.log("---",targetCourse)
// // const course=await User.findOne({courseProgress.course._id:courseId,user})
// return res.status(200).json({success:true,user})
//   } catch (error) {
//     console.error('Update course error:', error);
//     res.status(500).json({ 
//       message: "Server Error", 
//       error: error.message 
//     });
//   }
// };

// export const updateCourse= async (req, res) => {
//   try {
//     const { courseId, status } = req.body;
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     // Find course progress entry
//     let progressEntry = user.courseProgress.find(entry => entry.course.toString() === courseId);

//     if (progressEntry) {
//       // Update status
//       progressEntry.status = status;
//     } else {
//       // Add new progress entry if it doesn't exist
//       user.courseProgress.push({ course: courseId, status });
//     }

//     await user.save();
//     return res.status(200).json({ success: true, message: "Course progress updated", courseProgress: user.courseProgress });
//   } catch (error) {
//     console.error("Update course error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };


export const updateCourse = async (req, res) => {
  try {
    const { courseId, status } = req.body;
    const authheader = req.headers["authorization"];
    const token = authheader && authheader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if progress entry exists
    const progressIndex = user.courseProgress.findIndex(
      p => p.course.toString() === courseId
    );

    if (progressIndex !== -1) {
      // Update existing progress
      user.courseProgress[progressIndex].status = status;
    } else {
      // Create new progress entry
      user.courseProgress.push({
        course: courseId,
        status: status
      });
    }

    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: "Course status updated successfully" 
    });
    
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is the instructor or admin
    const isInstructor = course.instructor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isInstructor && !isAdmin) {
      return res.status(403).json({ 
        message: "You can only delete your own courses" 
      });
    }

    // Check if course has enrolled students
    if (course.studentsEnrolled && course.studentsEnrolled.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete course with enrolled students" 
      });
    }

    await Course.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: "Course deleted successfully" 
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message 
    });
  }
};

// Toggle course publish status
export const toggleCoursePublish = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: "You can only publish/unpublish your own courses" 
      });
    }

    // Validate course has required content before publishing
    if (!course.published && (!course.lessons || course.lessons.length === 0)) {
      return res.status(400).json({ 
        message: "Cannot publish course without lessons" 
      });
    }

    course.published = !course.published;
    course.updatedAt = new Date();
    await course.save();

    await course.populate('instructor', 'name email pic');
    
    res.status(200).json({
      message: `Course ${course.published ? 'published' : 'unpublished'} successfully`,
      course
    });

  } catch (error) {
    console.error('Toggle course publish error:', error);
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message 
    });
  }
};

// Get courses by instructor
//done***
export const getCoursesByInstructor = async (req, res) => {
  try{
    // console.log('=== GET INSTRUCTOR COURSES DEBUG ===');
    // console.log(req.headers)
    const decoded=jwt.verify(req.headers.authorization.split(" ")[1],process.env.JWT_SECRET)
    // console.log("Decoded JWT:",decoded)
    const instructorId=decoded.id
    const courses=await Course.find({instructor:instructorId}).populate('instructor','name email pic').sort({createdAt:-1})
    console.log("Courses found:",courses)
    return res.status(200).json({success:true,courses:courses})
  }
  catch (error) {
    console.error('Get instructor courses error:', error);
    return res.status(500).json({ 
      message: "Server Error", 
      error: error.message 
    });
  }
};

// export const getMyCourses = async (req, res) => {
//   try {
//     const authheader = req.headers["authorization"];
//     const token = authheader && authheader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const id = decoded.id;

//     const user = await User.findById(id).populate('coursesenrolled', 'title description price category');
//     const demo=await User.findById(id).populate('courseProgress','course status')
//     const courseId=demo.courseProgress.course
//     console.log("Your id-course",courseId)
//     console.log("The demo ---------",demo)
//     // const user=await User.findById(id).populate('courseProgress','course status').populate('course title desccription category')
    
//     if (user) {
//       const mycourses = user.coursesenrolled;
//       return res.status(200).json({ success: true, mycourses });
//     } else {
//       return res.status(400).json({ success: false, message: "user not found" });
//     }
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// }

// export const getMyCourses = async (req, res) => {
//   try {
//     const authheader = req.headers["authorization"];
//     const token = authheader && authheader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const id = decoded.id;
// console.log(id)
//     // Populate both coursesenrolled and courseProgress.course
//     const user = await User.findById(id)
//       .populate('coursesenrolled', 'title description price category')
//       .populate('courseProgress.course', 'title description price category');
//     console.log(user)
//     if (!user) {
//       return res.status(400).json({ success: false, message: "user not found" });
//     }

//     // Merge courses with their progress status
//     const coursesWithProgress = user.coursesenrolled.map(course => {
//       const progress = user.courseProgress.find(
//         p => p.course._id.toString() === course._id.toString()
//       );
      
//       return {
//         ...course.toObject(),
//         progressStatus: progress ? progress.status : 'not-started'
//       };
//     });

//     return res.status(200).json({ 
//       success: true, 
//       mycourses: coursesWithProgress 
//     });
    
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };
 

export const getMyCourses = async (req, res) => {
  try {
    const authheader = req.headers["authorization"];
    const token = authheader && authheader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id;

    const user = await User.findById(id)
      .populate('coursesenrolled', 'title description price category')
      .populate('courseProgress.course', 'title description price category');

    if (!user) {
      return res.status(400).json({ success: false, message: "user not found" });
    }

    // 🔑 Merge courses with progress and filter invalid/null progress
    const coursesWithProgress = user.coursesenrolled.map(course => {
      const progress = user.courseProgress.find(
        p => p.course && p.course._id.toString() === course._id.toString()
      );
      return {
        ...course.toObject(),
        progressStatus: progress ? progress.status : 'not-started'
      };
    });

    return res.status(200).json({ success: true, mycourses: coursesWithProgress });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
