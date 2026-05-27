import express from "express";
import {
  createPrescription,
  getMyPrescriptions,
} from "../controllers/prescriptionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPrescription);
router.get("/", protect, getMyPrescriptions);

export default router;
