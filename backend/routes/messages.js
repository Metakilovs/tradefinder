const express = require("express");
const Message = require("../models/Message");
const Booking = require("../models/Booking");
const protect = require("../middleware/auth");

const router = express.Router();

// GET /api/messages/:bookingId - get all messages for a booking
router.get("/:bookingId", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isParty =
      booking.client.toString() === req.user.id ||
      booking.tradesperson.toString() === req.user.id;
    if (!isParty) return res.status(403).json({ message: "Not authorized for this booking" });

    const messages = await Message.find({ booking: req.params.bookingId })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching messages" });
  }
});

// POST /api/messages - send a message in a booking chat
router.post("/", protect, async (req, res) => {
  try {
    const { bookingId, text } = req.body;
    if (!bookingId || !text) {
      return res.status(400).json({ message: "bookingId and text are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isParty =
      booking.client.toString() === req.user.id ||
      booking.tradesperson.toString() === req.user.id;
    if (!isParty) return res.status(403).json({ message: "Not authorized for this booking" });

    const message = await Message.create({
      booking: bookingId,
      sender: req.user.id,
      text,
    });

    const populated = await Message.findById(message._id).populate("sender", "name");

    // Emit real-time message to the booking chat room
    if (req.io) {
      req.io.to(`booking_${bookingId}`).emit("new_message", populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error sending message" });
  }
});

module.exports = router;
