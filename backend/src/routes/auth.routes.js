/**
 * Authentication routes
 */

const express = require("express");
const { registerUser } = require("../controllers/auth.controller");

const router = express.Router();

// Register user
router.post("/register", registerUser);

module.exports = router;
