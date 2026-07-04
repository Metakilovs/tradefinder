require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const tradespeopleRoutes = require("./routes/tradespeople");
const bookingRoutes = require("./routes/bookings");

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());
connectDB();

app.get("/", (req, res) => res.json({ message: "TradeFinder API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/tradespeople", tradespeopleRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TradeFinder API running on port ${PORT}`));