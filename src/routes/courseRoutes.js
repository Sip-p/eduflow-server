// import express from 'express';
// import { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse,getCoursesByInstructor,getMyCourses,addMyCourses,getInstdashboarddata} from '../controllers/courseController.js';
// import { authenticateToken } from '../middleware/authmiddleware.js'

// const router = express.Router();

// router.get('/', getAllCourses);
// router.post('/addmycourse',authenticateToken,addMyCourses);
// router.get('/mycourses',getMyCourses)

// router.get('/instructor-courses',getCoursesByInstructor)
// router.get('/instructor-dashboard',getInstdashboarddata)
// router.get('/:id', getCourseById);
// router.post('/create', createCourse);
// router.put('/stsupdate', updateCourse);
// router.delete('/:id', deleteCourse);
 

// export default router;


// import express from "express";
// import {
//   getAllCourses,
//   getCourseById,
//   createCourse,
//   updateCourse,
//   deleteCourse,
//   toggleCoursePublish,
//   getCoursesByInstructor,
//   getInstdashboarddata,
//   addMyCourses,
//   getMyCourses,
//   getCourseCurriculum,   // NEW
//   getLessonVideo,         // NEW
//   markLessonComplete,     // NEW
// } from "../controllers/courseController.js";
// import { protect, restrictTo } from "../middleware/authmiddleware.js";

// const router = express.Router();

// // ── Public routes ──────────────────────────────────────────────────────────
// router.get("/", getAllCourses);
// router.get("/:id", getCourseById);
// router.get("/:id/curriculum", getCourseCurriculum);   // course detail page

// // ── Instructor only ────────────────────────────────────────────────────────
// router.post("/create", protect, restrictTo("teacher"), createCourse);
// router.delete("/:id", protect, restrictTo("teacher"), deleteCourse);
// router.patch("/:id/publish", protect, restrictTo("teacher"), toggleCoursePublish);
// router.get("/instructor/my-courses", protect, restrictTo("teacher"), getCoursesByInstructor);
// router.get("/instructor/dashboard", protect, restrictTo("teacher"), getInstdashboarddata);

// // ── Student routes ─────────────────────────────────────────────────────────
// router.get("/student/my-courses", protect, restrictTo("student"), getMyCourses);
// router.post("/enroll", protect, restrictTo("student"), addMyCourses);
// router.patch("/:courseId/lesson/:lessonId/complete", protect, markLessonComplete);

// // ── Protected (any authenticated user) ────────────────────────────────────
// router.get("/:courseId/lesson/:lessonId/video", protect, getLessonVideo);
// router.patch("/progress", protect, updateCourse);

// export default router;

import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCoursePublish,
  getCoursesByInstructor,
  getInstdashboarddata,
  addMyCourses,
  getMyCourses,
  getCourseCurriculum,
  getLessonVideo,
  markLessonComplete,
} from "../controllers/courseController.js";
import { authenticateToken, restrictTo } from "../middleware/authmiddleware.js";

const router = express.Router();

// ── Public (no login needed) ──────────────────────────────────────────────
router.get("/", getAllCourses);
router.get("/instructor/courses",   authenticateToken, restrictTo("teacher"), getCoursesByInstructor);
router.get("/instructor-dashboard", authenticateToken, restrictTo("teacher"), getInstdashboarddata);
router.get("/mycourses",            authenticateToken, restrictTo("student"), getMyCourses);
router.get("/:id/curriculum",       getCourseCurriculum);
router.get("/:id",                  getCourseById);

// ── Instructor only ───────────────────────────────────────────────────────
router.post("/create",         authenticateToken, restrictTo("teacher"), createCourse);
router.delete("/:id",          authenticateToken, restrictTo("teacher"), deleteCourse);
router.patch("/:id/publish",   authenticateToken, restrictTo("teacher"), toggleCoursePublish);

// ── Student only ──────────────────────────────────────────────────────────
router.post("/addmycourse",    authenticateToken, restrictTo("student"), addMyCourses);

// ── Any logged-in user ────────────────────────────────────────────────────
router.put("/stsupdate",       authenticateToken, updateCourse);
router.get("/:courseId/lesson/:lessonId/video",      authenticateToken, getLessonVideo);
router.patch("/:courseId/lesson/:lessonId/complete", authenticateToken, markLessonComplete);

export default router;