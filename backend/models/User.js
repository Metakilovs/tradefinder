const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["client", "tradesperson"], required: true },

    // Tradesperson-only fields
    trade: { type: String, default: "" }, // e.g. "Plumber", "Electrician", "Carpenter"
    bio: { type: String, default: "" },
    hourlyRate: { type: Number, default: 0 }, // in KSh
    photoUrl: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    available: { type: Boolean, default: true },

    // Location - GeoJSON Point, used for "find tradespeople near me"
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" }); // enables geospatial "near me" queries

module.exports = mongoose.model("User", userSchema);
