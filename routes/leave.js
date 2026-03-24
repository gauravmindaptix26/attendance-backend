import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import {addLeave,getLeave,getLeaves,getdetail,updateLeave} from '../controllers/leaveController.js';


const router=express.Router();


router.post('/add',authMiddleware,addLeave)
router.get('/detail/:id',authMiddleware,getdetail)
router.get('/:id/:role',authMiddleware,getLeave)
router.put('/:id',authMiddleware,updateLeave)

router.get('/',authMiddleware,getLeaves)

export default router