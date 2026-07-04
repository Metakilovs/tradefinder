require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const tradespeopleRoutes = require("./routes/tradespeople");
const bookingRoutes = require("./routes/bookings");

const app = express();

app.use(cors({
  origin: ["https://tradefinder-dusky.vercel.app", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "TradeFinder API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tradespeople", tradespeopleRoutes);
app.use("/api/bookings", bookingRoutes);

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TradeFinder API running on port ${PORT}`));
