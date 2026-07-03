const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/auth");

const router = express.Router();

function publicUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  const { password, ...rest } = obj;
  return rest;
}

// GET /api/tradespeople?lng=..&lat=..&trade=Plumber&maxDistance=10000
// Finds tradespeople near a given point, optionally filtered by trade.
// maxDistance is in metres (default 15km).
router.get("/", async (req, res) => {
  try {
    const { lng, lat, trade, maxDistance } = req.query;

    const filter = { role: "tradesperson", available: true };
    if (trade) filter.trade = trade;

    let query;

    if (lng && lat) {
      filter.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: maxDistance ? parseInt(maxDistance) : 15000,
        },
      };
      query = User.find(filter);
    } else {
      // No location provided - just return all tradespeople (e.g. for first load)
      query = User.find(filter);
    }

    const tradespeople = await query.select("-password");
    res.json(tradespeople.map(publicUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching tradespeople" });
  }
});

// GET /api/tradespeople/:id - single profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user || user.role !== "tradesperson") {
      return res.status(404).json({ message: "Tradesperson not found" });
    }
    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// PUT /api/tradespeople/me/location - update my live location
router.put("/me/location", protect, async (req, res) => {
  try {
    const { lng, lat } = req.body;
    if (lng === undefined || lat === undefined) {
      return res.status(400).json({ message: "lng and lat are required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { location: { type: "Point", coordinates: [lng, lat] } },
      { new: true }
    ).select("-password");

    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ message: "Server error updating location" });
  }
});

// PUT /api/tradespeople/me - update my own profile (trade, bio, rate, availability)
router.put("/me", protect, async (req, res) => {
  try {
    if (req.user.role !== "tradesperson") {
      return res.status(403).json({ message: "Only tradespeople can edit this profile type" });
    }

    const { trade, bio, hourlyRate, available, photoUrl } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { trade, bio, hourlyRate, available, photoUrl },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ message: "Server error updating profile" });
  }
});

module.exports = router;
