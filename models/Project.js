import { Schema } from "mongoose";
import mongoose from "mongoose";

const projectSchema = new Schema({
  Title: { type: String, required: true },
  Client: { type: String },
  Address: { type: String },
  WoM: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String },

  
  employeeIds: [{ type: Schema.Types.ObjectId, ref: "Employee" }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Project=mongoose.model("Project",projectSchema);
export default Project;