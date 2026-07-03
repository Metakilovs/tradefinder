const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tradesperson: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true }, // what the client needs done
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed"],
      default: "pending",
    },
    clientLocation: {
      address: { type: String, default: "" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    rating: { type: Number, default: 0 }, // client rates tradesperson after completion
    review: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
