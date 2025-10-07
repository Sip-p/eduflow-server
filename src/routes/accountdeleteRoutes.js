import express from 'express'
const router=express.Router()
import {AccountDelete} from '../controllers/AccountDeleteController.js'

router.get('/',AccountDelete)
export default router