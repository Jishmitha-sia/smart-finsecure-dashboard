/**
 * Authentication routes
 */

const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route
router.get("/me", authMiddleware, getProfile);

module.exports = router;
