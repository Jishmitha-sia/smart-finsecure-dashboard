/**
 * Express app configuration
 * - Connects to database
 * - Syncs models
 * - Registers routes
 */

const express = require("express");
const cors = require("cors");
const { connectDB, sequelize } = require("./config/db");

require("./models/User");
require("./models/Transaction");

const authRoutes = require("./routes/auth.routes");
const transactionRoutes = require("./routes/transaction.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const seedRoutes = require("./routes/seed.routes");

const app = express();

// Enable CORS with environment-aware origins
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

// Parse JSON requests
app.use(express.json());

// Connect to database
connectDB();

// Sync database tables
sequelize
  .sync()
  .then(() => {
    console.log("✅ Database tables synced successfully");
  })
  .catch((error) => {
    console.error("❌ Failed to sync database tables:", error.message);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", seedRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Smart FinSecure Dashboard API is running",
  });
});

module.exports = app;
