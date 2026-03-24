import Employee from "../models/Employee.js";
import Project from "../models/Project.js";

export const addProject = async (req, res) => {
  try {
    const {
      Title,
      Client,
      Address,
      WoM,
      startDate,
      endDate,
      employeeIds = [], // Expecting an array of employee ObjectIds
      description,
    } = req.body;

    console.log(req.body);

    if (!Title || !Client || !Address || !WoM || !startDate || !employeeIds.length) {
      return res
        .status(400)
        .json({ success: false, error: "All required fields must be filled." });
    }

    // 1️⃣ Create the project
    const newProject = new Project({
      Title,
      Client,
      Address,
      WoM,
      startDate,
      endDate,
      employeeIds,
      description,
    });

    await newProject.save();

    // 2️⃣ Update employees to include this project
    if (employeeIds.length > 0) {
      await Employee.updateMany(
        { _id: { $in: employeeIds } },
        { $addToSet: { projects: newProject._id } } // $addToSet avoids duplicates
      );
    }

    res.status(201).json({ success: true, project: newProject });
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
export const ProjectList = async (req, res) => {
  try {
    // Fetch all projects and populate multiple employees
    const projects = await Project.find()
      .populate("employeeIds", "employeeId name") // note plural employeeIds
      .sort({ startDate: -1 });

    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const projectDetails = async (req, res) => {
  const { employeeIds } = req.body; 
  try {
    if (!employeeIds || employeeIds.length === 0) {
      return res.status(400).json({ success: false, message: "No employee IDs provided" });
    }

    // Extract _id from the array
    const ids = employeeIds.map(emp => emp._id);

    // Fetch employees
    const employees = await Employee.find({ _id: { $in: ids } })
      .populate("department", "dep_name"); // optional

    res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getEmployee = async (req, res) => {
  try {
    // Fetch employees from database
    const employees = await Employee.find()
      .populate("userId", "name email") // populate name/email from User
      .populate("department", "dep_name") // optional: populate department
      .lean();

    if (!employees.length) {
      return res.status(404).json({ success: false, error: "No employees found" });
    }

    res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ success: false, error: "Server error while fetching employees" });
  }
};