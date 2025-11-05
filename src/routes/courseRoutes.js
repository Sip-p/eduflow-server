import express from 'express';
import { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse,getCoursesByInstructor,getMyCourses,addMyCourses} from '../controllers/courseController.js';
import { authenticateToken } from '../middleware/authmiddleware.js'

const router = express.Router();

router.get('/', getAllCourses);
router.post('/addmycourse',authenticateToken,addMyCourses);
router.get('/mycourses',getMyCourses)

router.get('/instructor-courses',getCoursesByInstructor)
router.get('/:id', getCourseById);
router.post('/create', createCourse);
router.put('/stsupdate', updateCourse);
router.delete('/:id', deleteCourse);
 

export default router;