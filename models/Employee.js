import mongoose from "mongoose";
const { Schema } = mongoose;

const employeeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employeeId: { type: String, required: true, unique: true },
    dob: { type: Date },
    gender: { type: String },
    maritalStatus: { type: String },
    designation: { type: String },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    salary: { type: Number, required: true },
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],

    // 🆕 Image field (store Cloudinary URL + optional public_id)
    image: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
  },
  {
    timestamps: true, // replaces manual createdAt & updatedAt
  }
);

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
