import express from 'express'
import { createQuiz ,editQuiz,deleteQuiz,getAllQuizzesOfInstructor,getAllQuizzes,SubmitQuiz,getQuizResult,getMyAttemptedQuizzes,getQuizResultforInstructor} from '../controllers/QuizController.js'
import { authenticateToken } from '../middleware/authmiddleware.js'
const router=express.Router()

router.post('/create',authenticateToken,createQuiz)
router.get('/instructor-quizzes',authenticateToken,getAllQuizzesOfInstructor)
router.get('/allquizzes',authenticateToken,getAllQuizzes)
router.get('/myattemptedquizzes',authenticateToken,getMyAttemptedQuizzes)
router.get('/result/:id',authenticateToken,getQuizResult)
router.post('/submit',authenticateToken,SubmitQuiz)
router.post('/edit',authenticateToken,editQuiz)
router.post('/delete',authenticateToken,deleteQuiz)
router.get('/quizstats',authenticateToken,getQuizResultforInstructor)

export default router
