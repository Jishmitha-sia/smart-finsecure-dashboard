/**
 * Transaction routes
 */

const express = require("express");
const {
  createTransaction,
  getAllTransactions,
  getSpendingStats,
} = require("../controllers/transaction.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Create transaction
router.post("/", authMiddleware, createTransaction);

// Get all transactions
router.get("/", authMiddleware, getAllTransactions);

// Dashboard statistics
router.get("/stats", authMiddleware, getSpendingStats);

module.exports = router;
