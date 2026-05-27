import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: String,
    patientPhone: String,
    patientEmail: String,
    patientAddress: String,
    items: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      }
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
