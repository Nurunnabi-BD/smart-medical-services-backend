import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    dob: { type: String, default: "" },
    blood: { type: String, default: "" },
    gender: { type: String, default: "" },
    weight: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    emergency: { type: String, default: "" },
    occupation: { type: String, default: "" },
    about: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;