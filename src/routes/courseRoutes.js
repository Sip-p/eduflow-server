 

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
  markLessonComplete,autoEnrollFree
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
router.post("/auto-enroll/:courseId", authenticateToken, restrictTo("student"),autoEnrollFree )// ── Any logged-in user ────────────────────────────────────────────────────
router.put("/stsupdate",       authenticateToken, updateCourse);
router.get("/:courseId/lesson/:lessonId/video",      authenticateToken, getLessonVideo);
router.patch("/:courseId/lesson/:lessonId/complete", authenticateToken, markLessonComplete);


export default router;