import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URL;

    if (!mongoUri) {
      throw new Error("MONGODB_URL is missing. Add it to serv1/.env before starting the server.");
    }

    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectToDatabase;
