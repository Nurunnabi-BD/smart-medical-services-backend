import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g. "1-0-1"
        duration: { type: String, required: true }, // e.g. "7 Days"
        instructions: { type: String, default: "" }, // e.g. "After meal"
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
