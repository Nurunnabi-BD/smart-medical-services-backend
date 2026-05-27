import express from "express";
import {
  placeOrder,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const adminProtect = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

const router = express.Router();

router.post("/", protect, placeOrder);
router.get("/", protect, getOrders);
router.put("/:id/status", protect, adminProtect, updateOrderStatus);

export default router;
