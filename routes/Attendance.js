import express from 'express'
import {attendancecontroller, attendlist} from '../controllers/attendancecontroller.js'
import authMiddleware from '../middleware/authMiddleware.js'
import {attendance} from '../controllers/attendancecontroller.js'

const router= express.Router()
router.get('/',authMiddleware,attendancecontroller)
router.post('/:id',authMiddleware,attendance)
router.get('/attend/local',authMiddleware,attendlist)
export default router