import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get list of contacts who have chatted with the user
router.get("/contacts", protect, async (req, res) => {
  try {
    const myId = req.user._id;

    // Find all messages involving the logged-in user
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    }).sort({ createdAt: -1 });

    const contactIds = new Set();
    messages.forEach((msg) => {
      if (msg.sender.toString() !== myId.toString()) {
        contactIds.add(msg.sender.toString());
      }
      if (msg.receiver.toString() !== myId.toString()) {
        contactIds.add(msg.receiver.toString());
      }
    });

    const contactsList = [];
    for (const contactId of contactIds) {
      const u = await User.findById(contactId).select("name email role image dob gender");
      if (u) {
        // Find last message
        const lastMsg = messages.find(
          (m) =>
            (m.sender.toString() === myId.toString() && m.receiver.toString() === contactId) ||
            (m.sender.toString() === contactId && m.receiver.toString() === myId.toString())
        );

        // If contact is a doctor, fetch specialization and experience from Doctor schema
        let doctorProfile = null;
        if (u.role === "doctor") {
          doctorProfile = await Doctor.findOne({ user: contactId }).select("specialization image rating");
        }

        // Count unread messages from this contact to the user
        const unreadCount = await Message.countDocuments({
          sender: contactId,
          receiver: myId,
          isRead: false,
        });

        contactsList.push({
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          gender: u.gender,
          dob: u.dob,
          specialization: doctorProfile?.specialization || "",
          image: doctorProfile?.image || (u.role === "doctor" ? "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=250" : ""),
          lastMessage: lastMsg ? lastMsg.text : "",
          lastMessageTime: lastMsg ? lastMsg.createdAt : null,
          unreadCount,
          unread: unreadCount > 0,
        });
      }
    }

    res.json(contactsList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chat history with another user
router.get("/history/:otherUserId", protect, async (req, res) => {
  try {
    const myId = req.user._id;
    const { otherUserId } = req.params;

    // Mark messages from otherUserId to myId as read
    await Message.updateMany(
      { sender: otherUserId, receiver: myId, isRead: false },
      { isRead: true }
    );

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a new message
router.post("/", protect, async (req, res) => {
  try {
    const myId = req.user._id;
    const { receiverId, text } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ message: "Receiver ID and text content are required" });
    }

    const message = await Message.create({
      sender: myId,
      receiver: receiverId,
      text,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
