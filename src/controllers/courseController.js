import mongoose from "mongoose";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import Lesson from "../models/Lesson.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Assignment from "../models/Assignment.js";
import { io } from "../../index.js"; // adjust path based on where your controller is
import Quizzes from "../models/Quizzes.js";
// import { object } from "joi";
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
      // build notification docs for all students
      // ── after chapter loop ends ──
      if (published) {
        const students = await User.find({ role: "student" }, "_id");

        if (students.length > 0) {
          const notificationDocs = students.map((student) => ({
            recipient: student._id,
            type: "Course Published",
            message: `New course available: "${newCourse.title}" by ${req.user.name}`,
            course: newCourse._id,
            data: { courseId: newCourse._id, instructorName: req.user.name },
            read: false,
          }));

          // insert all into DB
          const created = await Notification.insertMany(notificationDocs);

          // emit to each student's personal room
          // req.io.to(userId) only reaches that specific user
          created.forEach((notif) => {
            req.io.to(notif.recipient.toString()).emit("notification", {
              _id: notif._id,
              type: notif.type,
              message: notif.message,
              course: newCourse._id,
              data: notif.data,
              read: false,
              createdAt: notif.createdAt,
            });
          });
        }
      }

    }
    // Step 3: Update totalDuration
    await Course.findByIdAndUpdate(newCourse._id, { totalDuration });

    // Step 4: Notification (non-critical)
    try {
      await Notification.create({
        recipient: instructorId,
        type: "Course Published",
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
//     // console.time("getAllCourses");
//     const courses = await Course.aggregate(pipeline);
//     // console.timeEnd("getAllCourses"); 
//     // const courses = await Course.aggregate(pipeline);
//     return res.status(200).json({ success: true, courses, total: courses.length });

//   } catch (error) {
//     console.error("Get all courses error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// }; 

export const getAllCourses = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;

    const skip = (page - 1) * limit;
    const { category, search, minPrice, maxPrice } = req.query;
    const matchStage = {}
    if (category) {
      matchStage.category = category;
    }
    if (minPrice || maxPrice) {
      matchStage.price = {}
      if (minPrice) {
        matchStage.price.$gte = Number(minPrice)
      }
      if (maxPrice) {
        matchStage.price.$lte = Number(maxPrice)
      }
    }
    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    const pipeline = [
      { ...Object.keys(matchStage).length > 0 ? { $match: matchStage } : { $match: {} } },
      {
        $lookup: {
          from: "users",
          localField: "instructor",
          foreignField: "_id",
          as: "instructorData"
        }
      },
      { $unwind: { path: "$instructorData", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          enrollmentCount: { $size: { $ifNull: ["$studentsEnrolled", []] } }
        }
      }
    ]






  } catch (error) {

  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET COURSE BY ID  GET /api/course/:id
// ─────────────────────────────────────────────────────────────────────────────
// export const getCourseById = async (req, res) => {
//   try {
//     const { id } = req.params;
// console.log("...")
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid course ID" });
//     }

//     const course = await Course.findById(id) ;
//     console.log("Course found:", course);
//     if (!course) return res.status(404).json({ success: false, message: "Course not found" });

//     return res.status(200).json({ success: true, course });

//   } catch (error) {
//     console.error("Get course by ID error:", error.message);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const result = await Course.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      // Join chapters with nested lessons
      {
        $lookup: {
          from: "chapters",
          localField: "_id",
          foreignField: "course",
          as: "chapters",
          pipeline: [
            { $sort: { order: 1 } },
            {
              $lookup: {
                from: "lessons",
                localField: "_id",
                foreignField: "chapter",
                as: "lessons",
                pipeline: [
                  { $sort: { order: 1 } },
                  {
                    $project: {
                      title: 1, duration: 1,
                      isFree: 1, order: 1,
                      videoUrl: 1, description: 1
                    }
                  }
                ]
              }
            },
            { $project: { title: 1, description: 1, order: 1, lessons: 1 } }
          ]
        }
      },

      // Join instructor
      {
        $lookup: {
          from: "users",
          localField: "instructor",
          foreignField: "_id",
          as: "instructor",
          pipeline: [{ $project: { name: 1, pic: 1, email: 1 } }]
        }
      },
      { $unwind: "$instructor" },

      {
        $addFields: {
          enrollmentCount: { $size: { $ifNull: ["$studentsEnrolled", []] } }
        }
      },
      { $project: { studentsEnrolled: 0, __v: 0 } }
    ]);

    if (!result.length) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({ success: true, course: result[0] });

  } catch (error) {
    console.error("Get course by ID error:", error.message);
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

    const isEnrolled = user?.coursesenrolled?.some((c) => c.course?.toString() === courseId);
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

// _________________________________________________________
//Auto Enroll in Free Course  POST /api/course/auto-enroll/:courseId
//___________________________________________________________
export const autoEnrollFree = async (req, res) => {
  try {
    const userId = req.user._id
    const { courseId } = req.params

    const course = await Course.findById(courseId)
    if (!course) return res.status(404).json({ success: false, message: "Course not found" })
    if (course.price > 0) return res.status(400).json({ success: false, message: "Course is not free" })

    const alreadyEnrolled = await User.findOne({ _id: userId, "coursesenrolled.course": courseId })
    if (alreadyEnrolled) return res.status(200).json({ success: true, message: "Already enrolled" })

    await User.findByIdAndUpdate(userId, {
      $push: {
        coursesenrolled: { course: courseId, progressStatus: "in-progress" }
      }
    })

    return res.status(200).json({ success: true, message: "Enrolled successfully" })
  } catch (error) {
    console.error("Auto enroll error:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}
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
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🔥 1. Update courseProgress
    const progressIndex = user.courseProgress.findIndex(
      (p) => p.course?.toString() === courseId
    );

    if (progressIndex !== -1) {
      user.courseProgress[progressIndex].status = status;
    } else {
      user.courseProgress.push({
        course: courseId,
        status,
        completedLessons: [],
        progressPercent: 0,
      });
    }

    // 🔥 2. ALSO update coursesenrolled (VERY IMPORTANT)
    const enrolledIndex = user.coursesenrolled.findIndex(
      (c) => c.course?.toString() === courseId
    );

    if (enrolledIndex !== -1) {
      user.coursesenrolled[enrolledIndex].progressStatus = status;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Course status updated",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
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

    // ── Only notify when publishing, not unpublishing ──
    if (course.published) {
      // find all students
      const students = await User.find({ role: "student" }, "_id");

      // // build notification docs for all students
      // const notifications = students.map((student) => ({
      //   recipient: student._id,
      //   type:      "Course Published",
      //   message:   `New course available: "${course.title}" by ${course.instructor.name}`,
      //   course:    course._id,
      //   data:      { courseId: course._id, instructorName: course.instructor.name },
      // }));

      // // bulk insert — one DB call instead of N
      // const created = await Notification.insertMany(notifications);

      // // emit socket event to each student who is currently online
      // const io = io();
      // created.forEach((notif) => {
      //   io.to(notif.recipient.toString()).emit("notification", {
      //     _id:       notif._id,
      //     type:      notif.type,
      //     message:   notif.message,
      //     course:    course._id,
      //     data:      notif.data,
      //     read:      false,
      //     createdAt: notif.createdAt,
      //   });
      // });
    }

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

        }
      },
    ]);

    const totalAssignments = await Assignment.countDocuments({ instructor: instructorId });
    const totalQuizzes = await Quizzes.countDocuments({ instructor: instructorId })
    return res.status(200).json({
      success: true,
      data: {
        totalCourses: stats?.totalCourses || 0,
        totalStudents: stats?.totalStudents || 0,
        totalRevenue: stats?.totalRevenue || 0,
        publishedCourses: stats?.publishedCourses || 0,
        totalAssignments, totalQuizzes
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
      (c) => c.course?.toString() === courseId
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: "Already enrolled" });
    }

    // Two separate writes (no transaction on standalone MongoDB)
    await User.findByIdAndUpdate(userId, {
      $push: {
        coursesenrolled: { course: courseId, progressStatus: "in-progress" }, courseProgress: {
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
      .populate("coursesenrolled.course", "title description price category thumbnail totalLessons totalDuration")
      .populate("courseProgress.course", "title totalLessons");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // const coursesWithProgress = user.coursesenrolled.map((course) => {
    //   const progress = user.courseProgress.find(
    //     (p) => p.course?._id?.toString() === course._id.toString()
    //   );
    //   return {
    //     ...course.toObject(),
    //     progressStatus: progress?.status || "not started",
    //     progressPercent: progress?.progressPercent || 0,
    //     completedLessons: progress?.completedLessons?.length || 0,
    //     lastAccessedLesson: progress?.lastAccessedLesson || null,
    //   };
    // });
    const coursesWithProgress = user.coursesenrolled
      .filter((enrolled) => enrolled.course != null)  // ← skip orphaned enrollments
      .map((enrolled) => {
        const course = enrolled.course
        const progress = user.courseProgress?.find(
          (p) => p.course?._id?.toString() === course._id.toString()
        )
        return {
          ...course.toObject(),
          progressStatus: enrolled.progressStatus || "in-progress",
          progressPercent: progress?.progressPercent || 0,
          completedLessons: progress?.completedLessons?.length || 0,
          lastAccessedLesson: progress?.lastAccessedLesson || null,
        }
      })
    return res.status(200).json({ success: true, mycourses: coursesWithProgress });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};