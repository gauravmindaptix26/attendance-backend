import { Schema } from "mongoose";
import mongoose from "mongoose";

const externalCollaboratorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    organization: { type: String, trim: true },
    role: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
);

const sharedResourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    resourceType: {
      type: String,
      enum: ["google-drive", "onedrive", "dropbox", "document", "folder", "other"],
      default: "other",
    },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const projectSchema = new Schema({
  Title: { type: String, required: true },
  Client: { type: String },
  Address: { type: String },
  WoM: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String },

  employeeIds: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
  externalCollaborators: [externalCollaboratorSchema],
  sharedResources: [sharedResourceSchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Project=mongoose.model("Project",projectSchema);
export default Project;
