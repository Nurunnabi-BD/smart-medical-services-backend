import express from "express";
import {
  registerDoctor,
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorProfile,
} from "../controllers/doctorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerDoctor);
router.get("/", getDoctors);
router.get("/profile", protect, getMyDoctorProfile);
router.put("/profile", protect, updateDoctorProfile);
router.get("/:id", getDoctorById);

export default router;