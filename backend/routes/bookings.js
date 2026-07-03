const express = require("express");
const Booking = require("../models/Booking");
const User = require("../models/User");
const protect = require("../middleware/auth");

const router = express.Router();

// POST /api/bookings - client requests a tradesperson
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only clients can create booking requests" });
    }

    const { tradespersonId, description, address, lng, lat } = req.body;
    if (!tradespersonId || !description) {
      return res.status(400).json({ message: "tradespersonId and description are required" });
    }

    const tradesperson = await User.findById(tradespersonId);
    if (!tradesperson || tradesperson.role !== "tradesperson") {
      return res.status(404).json({ message: "Tradesperson not found" });
    }

    const booking = await Booking.create({
      client: req.user.id,
      tradesperson: tradespersonId,
      description,
      clientLocation: {
        address: address || "",
        coordinates: lng !== undefined && lat !== undefined ? [lng, lat] : [0, 0],
      },
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating booking" });
  }
});

// GET /api/bookings/mine - bookings relevant to the logged-in user (either role)
router.get("/mine", protect, async (req, res) => {
  try {
    const filter =
      req.user.role === "client" ? { client: req.user.id } : { tradesperson: req.user.id };

    const bookings = await Booking.find(filter)
      .populate("client", "name phone")
      .populate("tradesperson", "name phone trade")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching bookings" });
  }
});

// PUT /api/bookings/:id/status - tradesperson accepts/declines, either side marks completed
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["accepted", "declined", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isParty =
      booking.client.toString() === req.user.id || booking.tradesperson.toString() === req.user.id;
    if (!isParty) return res.status(403).json({ message: "Not authorized for this booking" });

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Server error updating booking status" });
  }
});

// PUT /api/bookings/:id/review - client rates a completed booking
router.put("/:id/review", protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.client.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the client can review this booking" });
    }

    booking.rating = rating;
    booking.review = review || "";
    await booking.save();

    // Recalculate tradesperson's average rating
    const allReviews = await Booking.find({
      tradesperson: booking.tradesperson,
      rating: { $gt: 0 },
    });
    const avg = allReviews.reduce((sum, b) => sum + b.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(booking.tradesperson, {
      rating: avg,
      reviewCount: allReviews.length,
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Server error submitting review" });
  }
});

module.exports = router;
