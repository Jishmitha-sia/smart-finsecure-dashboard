/**
 * Transaction routes
 */

const express = require("express");
const { createTransaction } = require("../controllers/transaction.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Create transaction (protected)
router.post("/", authMiddleware, createTransaction);

module.exports = router;
