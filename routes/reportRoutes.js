import express from "express";
import {
  uploadReport,
  getMyReports,
  deleteReport,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, uploadReport);
router.get("/", protect, getMyReports);
router.delete("/:id", protect, deleteReport);

export default router;
