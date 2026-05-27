import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("👉 Please ensure that your current IP address is whitelisted in your MongoDB Atlas Network Access settings (set to allow 0.0.0.0/0 or add your current IP).");
  }
};

export default connectDB;