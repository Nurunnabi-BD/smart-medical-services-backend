import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      default: 0,
    },
    fees: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      default: "Male",
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    available: {
      type: Boolean,
      default: true,
    },
    slots: {
      type: [String],
      default: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);