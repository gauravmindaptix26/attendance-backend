import express from 'express'
import multer from "multer";
import authMiddleware from '../middleware/authMiddleware.js'
import {addProject,ProjectList,projectDetails,getEmployee} from '../controllers/ProjectController.js';


const router=express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/',authMiddleware,getEmployee)
router.put('/add',authMiddleware,upload.array("sharedFiles", 10),addProject)
router.get('/projectList',authMiddleware,ProjectList)
router.post('/projectDetails',authMiddleware,projectDetails)

export default router
