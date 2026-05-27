import Prescription from "../models/Prescription.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

// Create Prescription (Doctor Action)
export const createPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, medicines } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile || appointment.doctor.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({ message: "Not authorized to prescribe for this appointment" });
    }

    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: appointment.patient,
      doctor: doctorProfile._id,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      diagnosis,
      medicines,
    });

    // Update appointment status to show it is resolved/completed or keep it
    appointment.status = "completed";
    await appointment.save();

    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get My Prescriptions (Patient or Doctor)
export const getMyPrescriptions = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      query.doctor = doctorProfile._id;
    } else if (req.user.role === "admin") {
      // Admins see all
      query = {};
    } else {
      // Patients
      query.patient = req.user._id;
    }

    const prescriptions = await Prescription.find(query)
      .populate("doctor")
      .populate("patient", "name email dob gender")
      .populate("appointment");

    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
