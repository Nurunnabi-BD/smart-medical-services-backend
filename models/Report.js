import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true, // Stores data URL or mock file path
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
