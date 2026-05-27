import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import Order from "../models/Order.js";

// Get Platform Stats
export const getStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalAppointments = await Appointment.countDocuments();
    const totalPrescriptions = await Prescription.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Aggregate monthly appointments for stats chart
    const appointments = await Appointment.find({}, "createdAt status");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = months.map((month, index) => {
      const monthlyAppts = appointments.filter((appt) => {
        const date = new Date(appt.createdAt);
        return date.getMonth() === index;
      });
      return {
        month,
        appointments: monthlyAppts.length,
        completed: monthlyAppts.filter((a) => a.status === "completed").length,
      };
    });

    res.json({
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalPrescriptions,
        totalOrders,
      },
      chartData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Separated Patients and Doctors Lists
export const getAllUsers = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    const doctors = await Doctor.find(); // Has specialization, experience, fees, etc.
    res.json({ patients, doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Block or Delete User
export const deleteOrBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    // If not found in User, it might be a doctor's profile ID or user ID
    if (!user) {
      // Try to find if it's a doctor profile ID
      const doctor = await Doctor.findById(req.params.id);
      if (doctor) {
        await User.deleteOne({ _id: doctor.user });
        await doctor.deleteOne();
        return res.json({ message: "Doctor user and profile deleted successfully" });
      }
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "doctor") {
      await Doctor.deleteOne({ user: user._id });
    }

    await user.deleteOne();
    res.json({ message: "User account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
