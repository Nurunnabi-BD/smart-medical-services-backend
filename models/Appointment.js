import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },

    date: String,
    time: String,
    
    patientName: String,
    patientPhone: String,
    patientEmail: String,
    patientGender: String,
    patientDob: String,
    appointmentType: {
      type: String,
      default: "In-Person Visit",
    },
    reason: String,

    status: {
      type: String,
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);