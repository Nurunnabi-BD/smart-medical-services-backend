import Order from "../models/Order.js";
import Medicine from "../models/Medicine.js";

// Place a new medicine order
export const placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, patientName, patientPhone, patientEmail, patientAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item." });
    }

    // Create the order
    const order = await Order.create({
      patient: req.user._id,
      patientName: patientName || req.user.name,
      patientPhone: patientPhone || req.user.phone,
      patientEmail: patientEmail || req.user.email,
      patientAddress: patientAddress || req.user.location,
      items: items.map(item => ({
        medicine: item.medicine._id || item.medicine,
        quantity: item.quantity,
        price: item.medicine.price || item.price,
      })),
      totalAmount,
      status: "Pending",
      paymentMethod: "Cash on Delivery",
    });

    // Update medicine stock in parallel
    for (const item of items) {
      const medId = item.medicine._id || item.medicine;
      const medicine = await Medicine.findById(medId);
      if (medicine) {
        medicine.stock = Math.max(0, medicine.stock - item.quantity);
        await medicine.save();
      }
    }

    // Populate order medicine info for the response
    const populatedOrder = await Order.findById(order._id)
      .populate("items.medicine")
      .populate("patient", "name email");

    res.status(201).json(populatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders (Admin gets all, Patient gets their own)
export const getOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === "admin") {
      orders = await Order.find()
        .populate("items.medicine")
        .populate("patient", "name email phone dob blood gender weight height")
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ patient: req.user._id })
        .populate("items.medicine")
        .populate("patient", "name email")
        .sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; // Pending, Completed, Cancelled
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status || order.status;
    const updated = await order.save();

    const populatedUpdated = await Order.findById(updated._id)
      .populate("items.medicine")
      .populate("patient", "name email");

    res.json(populatedUpdated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
