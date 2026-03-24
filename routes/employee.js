import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  fetchEmployeesByDepId,
  getProjects,
} from "../controllers/employeeController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Routes
router.get("/", authMiddleware, getEmployees);
router.get("/projects/:id", authMiddleware, getProjects);

// ✅ Add Employee with image upload
router.post("/add", authMiddleware,upload.single("image"), addEmployee);

router.get("/:id", authMiddleware, getEmployee);
router.put("/:id", authMiddleware, updateEmployee);
router.get("/department/:id", authMiddleware, fetchEmployeesByDepId);

export default router;
