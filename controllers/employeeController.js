import multer from "multer";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import Project from "../models/Project.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import streamifier from "streamifier";

// ✅ Use memoryStorage for uploads
const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      password,
      role,
      projects = [],
    } = req.body;

    if (
      !name ||
      !email ||
      !employeeId ||
      !department ||
      !salary ||
      !password ||
      !role
    ) {
      return res
        .status(400)
        .json({ success: false, error: "All required fields must be filled." });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "User already registered" });
    }

    // ✅ Upload image to Cloudinary directly from memory
    let uploadedImage = null;
    if (req.file) {
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "ems_uploads" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      uploadedImage = await streamUpload(req);
    }

    // ✅ Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user
    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role,
      profileImage: uploadedImage ? uploadedImage.secure_url : "",
    });

    const savedUser = await newUser.save();

    // ✅ Create new employee linked to that user
    const newEmployee = new Employee({
      userId: savedUser._id,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      projects,
      image: uploadedImage
        ? { url: uploadedImage.secure_url, public_id: uploadedImage.public_id }
        : undefined,
    });

    await newEmployee.save();

    // ✅ Update projects (if assigned)
    if (projects && projects.length > 0) {
      await Project.updateMany(
        { _id: { $in: projects } },
        { $addToSet: { employeeIds: newEmployee._id } }
      );
    }

    res.status(201).json({ success: true, employee: newEmployee });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// ✅ Get all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId", "-password")
      .populate("department")
      .populate("projects", "Title")
      .lean();

    return res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Server error fetching employees" });
  }
};

// ✅ Get employee by ID or userId
export const getEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    let employee = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      employee = await Employee.findById(id)
        .populate("userId", { password: 0 })
        .populate("department")
        .populate("projects", "Title");
    }

    if (!employee) {
      employee = await Employee.findOne({ userId: id })
        .populate("userId", { password: 0 })
        .populate("department");
    }

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    console.log("Employee found:", employee._id.toString());
    return res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error("Error in getEmployee:", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Server error in getEmployee" });
  }
};

// ✅ Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, maritalStatus, designation, department, salary } = req.body;

    const employee = await Employee.findById({ _id: id });
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "employee not found" });
    }

    await User.findByIdAndUpdate({ _id: employee.userId }, { name });
    await Employee.findByIdAndUpdate(
      { _id: id },
      { maritalStatus, designation, salary, department }
    );

    return res
      .status(200)
      .json({ success: true, message: "employee updated" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "update employees server error" });
  }
};

// ✅ Fetch employees by department
export const fetchEmployeesByDepId = async (req, res) => {
  const { id } = req.params;
  try {
    const employees = await Employee.find({ department: id });
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get employees by DepId server error" });
  }
};

// ✅ Get projects assigned to an employee
export const getProjects = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid employee ID" });
    }

    const projects = await Project.find({ employeeIds: id }).select(
      "Title Client startDate endDate"
    );

    return res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error("Error fetching projects for employee:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error while fetching projects" });
  }
};
