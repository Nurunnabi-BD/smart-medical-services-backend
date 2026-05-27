import express from "express";
import {
  getStats,
  getAllUsers,
  deleteOrBlockUser,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";

const adminProtect = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

const router = express.Router();

router.get("/stats", protect, adminProtect, getStats);
router.get("/users", protect, adminProtect, getAllUsers);
router.delete("/users/:id", protect, adminProtect, deleteOrBlockUser);

export default router;
