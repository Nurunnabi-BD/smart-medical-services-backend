import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register Doctor
export const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, experience, fees, gender, slots } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User/Doctor already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create auth credentials in User model
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
    });

    // Create doctor profile linked to User
    const doctor = await Doctor.create({
      user: user._id,
      name,
      email,
      specialization,
      experience: Number(experience) || 0,
      fees: Number(fees) || 0,
      gender: gender || "Male",
      slots: slots || ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      doctorProfile: doctor,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Doctors (with Search and Filters)
export const getDoctors = async (req, res) => {
  try {
    const { search, specialist, gender, availability, experience } = req.query;
    let query = {};

    // Filter by search (name or specialization)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by specialization
    if (specialist && specialist !== "All") {
      query.specialization = specialist;
    }

    // Filter by gender
    if (gender && gender !== "All") {
      query.gender = gender;
    }

    // Filter by availability
    if (availability && availability === "Available") {
      query.available = true;
    }

    // Filter by experience
    if (experience && experience !== "All") {
      if (experience === "0-5") {
        query.experience = { $lte: 5 };
      } else if (experience === "5-10") {
        query.experience = { $gt: 5, $lte: 10 };
      } else if (experience === "10+") {
        query.experience = { $gt: 10 };
      }
    }

    const doctors = await Doctor.find(query);
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Doctor By ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Logged-in Doctor Profile
export const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Doctor Profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    // Update doctor fields
    doctor.specialization = req.body.specialization || doctor.specialization;
    doctor.experience = req.body.experience !== undefined ? Number(req.body.experience) : doctor.experience;
    doctor.fees = req.body.fees !== undefined ? Number(req.body.fees) : doctor.fees;
    doctor.gender = req.body.gender || doctor.gender;
    doctor.slots = req.body.slots || doctor.slots;
    doctor.available = req.body.available !== undefined ? req.body.available : doctor.available;
    doctor.image = req.body.image || doctor.image;

    // Update User model (name or image) if changed
    const userUpdates = {};
    if (req.body.name) {
      doctor.name = req.body.name;
      userUpdates.name = req.body.name;
    }
    if (req.body.image) {
      userUpdates.image = req.body.image;
    }
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};