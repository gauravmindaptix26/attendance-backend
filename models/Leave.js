import mongoose from "mongoose";
const { Schema } = mongoose;

const leaveSchema = new Schema({
  // 🔹 Link to employee
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },

  // 🔹 General Details
  date: { type: Date, default: Date.now }, // Date of application
  name: { type: String }, // Name of employee (for easy display)
  designation: { type: String }, // Optional, as per form

  // 🔹 Leave Details
  leaveType: {
    type: String,
    enum: ["Sick Leave", "Casual Leave", "Annual Leave"],
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  noOfDays: { type: Number }, // optional field
  reason: { type: String, required: true },

  // 🔹 Status & Metadata
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // 🔹 For Office Use Only (Admin fields)
  totalEntitlement: { type: Number, default: 0 },
  totalAvailed: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  recommendedBy: { type: String },
  approvedBy: { type: String },
});

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
