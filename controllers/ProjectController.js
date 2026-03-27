import Employee from "../models/Employee.js";
import Project from "../models/Project.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const normalizeExternalCollaborators = (collaborators = []) =>
  collaborators
    .filter((collaborator) => collaborator?.name?.trim())
    .map((collaborator) => ({
      name: collaborator.name.trim(),
      organization: collaborator.organization?.trim() || "",
      role: collaborator.role?.trim() || "",
      email: collaborator.email?.trim().toLowerCase() || "",
      phone: collaborator.phone?.trim() || "",
    }));

const normalizeSharedResources = (resources = []) =>
  resources
    .filter((resource) => resource?.title?.trim() && resource?.url?.trim())
    .map((resource) => ({
      title: resource.title.trim(),
      url: resource.url.trim(),
      sourceType: "link",
      resourceType: resource.resourceType || "other",
      notes: resource.notes?.trim() || "",
    }));

const inferResourceTypeFromFile = (file) => {
  const mimeType = file.mimetype || "";
  if (mimeType.includes("pdf") || mimeType.includes("text") || mimeType.includes("word")) {
    return "document";
  }

  return "other";
};

const uploadFileToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "project_resources",
        resource_type: "auto",
      },
      (error, result) => {
        if (result) {
          resolve(result);
          return;
        }

        reject(error);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });

const parseProjectPayload = (body) => {
  if (body?.projectData) {
    return JSON.parse(body.projectData);
  }

  return body;
};

export const addProject = async (req, res) => {
  try {
    const payload = parseProjectPayload(req.body);
    const {
      Title,
      Client,
      Address,
      WoM,
      startDate,
      endDate,
      employeeIds = [],
      description,
      externalCollaborators = [],
      sharedResources = [],
    } = payload;

    const cleanTitle = Title?.trim();
    const cleanClient = Client?.trim();
    const cleanAddress = Address?.trim();
    const cleanWoM = WoM?.trim();

    if (!cleanTitle || !cleanClient || !cleanAddress || !cleanWoM || !startDate) {
      return res.status(400).json({
        success: false,
        error: "Title, client, address, work order and start date are required.",
      });
    }

    const cleanEmployeeIds = [...new Set(employeeIds.filter(Boolean))];
    const cleanCollaborators = normalizeExternalCollaborators(externalCollaborators);
    const cleanSharedResources = normalizeSharedResources(sharedResources);

    const invalidResource = cleanSharedResources.find((resource) => {
      try {
        const parsed = new URL(resource.url);
        return !["http:", "https:"].includes(parsed.protocol);
      } catch {
        return true;
      }
    });

    if (invalidResource) {
      return res.status(400).json({
        success: false,
        error: "Shared resource links must be valid http or https URLs.",
      });
    }

    const uploadedResources = await Promise.all(
      (req.files || []).map(async (file) => {
        const uploadedFile = await uploadFileToCloudinary(file);

        return {
          title: file.originalname,
          url: uploadedFile.secure_url,
          sourceType: "upload",
          resourceType: inferResourceTypeFromFile(file),
          notes: "",
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          publicId: uploadedFile.public_id,
        };
      })
    );

    const newProject = new Project({
      Title: cleanTitle,
      Client: cleanClient,
      Address: cleanAddress,
      WoM: cleanWoM,
      startDate,
      endDate: endDate || null,
      employeeIds: cleanEmployeeIds,
      description: description?.trim() || "",
      externalCollaborators: cleanCollaborators,
      sharedResources: [...cleanSharedResources, ...uploadedResources],
      updatedAt: new Date(),
    });

    await newProject.save();

    if (cleanEmployeeIds.length > 0) {
      await Employee.updateMany(
        { _id: { $in: cleanEmployeeIds } },
        { $addToSet: { projects: newProject._id } }
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
    const projects = await Project.find()
      .populate({
        path: "employeeIds",
        select: "employeeId designation department userId",
        populate: [
          { path: "department", select: "dep_name" },
          { path: "userId", select: "name email" },
        ],
      })
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
      return res.status(200).json({ success: true, employees: [] });
    }

    const ids = employeeIds
      .map((employee) => (typeof employee === "string" ? employee : employee?._id))
      .filter(Boolean);

    const employees = await Employee.find({ _id: { $in: ids } })
      .populate("department", "dep_name")
      .populate("userId", "name email");

    res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId", "name email")
      .populate("department", "dep_name")
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
