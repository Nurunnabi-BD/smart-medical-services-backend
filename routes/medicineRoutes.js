import express from "express";
import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../controllers/medicineController.js";
import { protect } from "../middleware/authMiddleware.js";

const adminProtect = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

const router = express.Router();

router.get("/", getMedicines);
router.get("/:id", getMedicineById);

// Admin Restricted
router.post("/", protect, adminProtect, createMedicine);
router.put("/:id", protect, adminProtect, updateMedicine);
router.delete("/:id", protect, adminProtect, deleteMedicine);

export default router;
