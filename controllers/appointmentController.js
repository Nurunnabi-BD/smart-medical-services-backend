import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

// Book Appointment
export const bookAppointment = async (req, res) => {
  try {
    const {
      doctor,
      date,
      time,
      patientName,
      patientPhone,
      patientEmail,
      patientGender,
      patientDob,
      appointmentType,
      reason,
    } = req.body;

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      date,
      time,
      patientName,
      patientPhone,
      patientEmail,
      patientGender,
      patientDob,
      appointmentType: appointmentType || "In-Person Visit",
      reason,
      status: "pending",
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get My Appointments (Role-based)
export const myAppointments = async (req, res) => {
  try {
    let data;

    if (req.user.role === "doctor") {
      // Find doctor profile
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      data = await Appointment.find({ doctor: doctorProfile._id })
        .populate("doctor")
        .populate("patient", "name email phone dob blood gender weight height");
    } else if (req.user.role === "admin") {
      data = await Appointment.find()
        .populate("doctor")
        .populate("patient", "name email phone dob blood gender weight height");
    } else {
      // Patient
      data = await Appointment.find({ patient: req.user._id })
        .populate("doctor")
        .populate("patient", "name email phone dob blood gender weight height");
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Appointment Status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body; // approved, rejected, cancelled
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Authorization checks
    if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (!doctorProfile || appointment.doctor.toString() !== doctorProfile._id.toString()) {
        return res.status(403).json({ message: "Not authorized to update this appointment" });
      }
    } else if (req.user.role !== "admin" && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this appointment" });
    }

    appointment.status = status || appointment.status;
    const updated = await appointment.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Appointment Payment Status (Admin or Patient Owner)
export const updateAppointmentPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body; // Pending, Paid

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check authorization: Admin or the patient who owns this appointment
    if (req.user.role !== "admin" && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update payment status" });
    }

    appointment.paymentStatus = paymentStatus || appointment.paymentStatus;
    const updated = await appointment.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};