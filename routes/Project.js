import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import {addProject,ProjectList,projectDetails,getEmployee} from '../controllers/ProjectController.js';


const router=express.Router();
router.get('/',authMiddleware,getEmployee)
router.put('/add',authMiddleware,addProject)
router.get('/projectList',authMiddleware,ProjectList)
router.post('/projectDetails',authMiddleware,projectDetails)

export default router