import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Doctor from "./models/Doctor.js";

const seedUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding users...");

    // Clear existing users and doctor profiles
    await User.deleteMany({});
    await Doctor.deleteMany({});
    console.log("Cleared existing users and doctor profiles.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // 1. Create Admin
    const admin = await User.create({
      name: "System Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      phone: "01700000000",
      location: "Dhaka, Bangladesh",
    });
    console.log("Admin user seeded successfully!");

    // 2. Create Patient
    const patient = await User.create({
      name: "John Doe",
      email: "patient@example.com",
      password: hashedPassword,
      role: "patient",
      phone: "01712345678",
      location: "Dhaka, Bangladesh",
      blood: "O+",
      gender: "Male",
      weight: 70,
      height: 175,
      dob: "1995-10-15",
    });
    console.log("Patient user seeded successfully!");

    // 3. Create Doctor User
    const doctorUser = await User.create({
      name: "Dr. Sarah Rahman",
      email: "doctor@example.com",
      password: hashedPassword,
      role: "doctor",
      phone: "01711223344",
      location: "Dhaka, Bangladesh",
      gender: "Female",
    });

    // 4. Create Doctor Profile
    await Doctor.create({
      user: doctorUser._id,
      name: "Dr. Sarah Rahman",
      email: "doctor@example.com",
      specialization: "Cardiology Specialist",
      experience: 12,
      fees: 800,
      gender: "Female",
      rating: 4.9,
      available: true,
      slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=350",
    });
    console.log("Doctor user and profile seeded successfully!");

    console.log("\n=========================================");
    console.log("Seeding Completed Successfully!");
    console.log("Default Logins:");
    console.log("-----------------------------------------");
    console.log("1. Admin:   admin@example.com   / password123");
    console.log("2. Doctor:  doctor@example.com  / password123");
    console.log("3. Patient: patient@example.com / password123");
    console.log("=========================================\n");

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding users failed:", error.message);
    process.exit(1);
  }
};

seedUsers();
