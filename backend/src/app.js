/**
 * Express app configuration
 * - Connects to database
 * - Syncs models
 * - Registers middlewares and routes
 */

const express = require("express");
const cors = require("cors");
const { connectDB, sequelize } = require("./config/db");
const User = require("./models/User");

const app = express();

// Enable CORS
app.use(cors());

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

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Smart FinSecure Dashboard API is running",
  });
});

module.exports = app;
