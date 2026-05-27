import express from "express";
import {
  bookAppointment,
  myAppointments,
  updateAppointmentStatus,
  updateAppointmentPaymentStatus,
} from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, bookAppointment);
router.get("/", protect, myAppointments);
router.put("/:id/status", protect, updateAppointmentStatus);
router.put("/:id/payment", protect, updateAppointmentPaymentStatus);

export default router;