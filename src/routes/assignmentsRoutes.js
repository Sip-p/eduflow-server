import express from 'express'
const router=express.Router()
import {createAssignment,getCourseAssignments,openAssignment} from '../controllers/AssignmentController.js'
import { authenticateToken } from '../middleware/authmiddleware.js'
router.post('/createassignment',authenticateToken,createAssignment)
router.get('/courseassignments/:courseId',authenticateToken,getCourseAssignments)
router.get("/open/:publicId", openAssignment);
export default router