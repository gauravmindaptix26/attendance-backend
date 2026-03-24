import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import connectToDatabase from "./db/db.js";
import User from "./models/User.js";

dotenv.config();

const userRegister = async () => {
  try {
    // Connect to the database
    await connectToDatabase();

    // Check if an admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
    if (existingAdmin) {
      console.log("⚠️ Admin user already exists!");
      return process.exit(0);
    }

    // Hash password
    const hashPassword = await bcrypt.hash("admin", 10);

    // Create new admin user
    const newUser = new User({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashPassword,
      role: "admin",
    });

    await newUser.save();

    console.log("✅ Admin user created successfully!");
    console.log("👉 Email: admin@gmail.com");
    console.log("👉 Password: admin");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error.message);
  } finally {
    // Close connection after seeding
    mongoose.connection.close();
  }
};

userRegister();
