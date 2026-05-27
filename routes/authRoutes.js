import express from "express";
import {
  registerUser,
  loginUser,
  updateUserProfile,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// 🔐 Protected Routes
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});
router.put("/profile", protect, updateUserProfile);

export default router;