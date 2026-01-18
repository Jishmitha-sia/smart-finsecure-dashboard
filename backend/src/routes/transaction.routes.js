/**
 * Transaction routes
 */

const express = require("express");
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSpendingStats,
  getFlaggedTransactions,
  markTransactionLegitimate,
} = require("../controllers/transaction.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Create transaction
router.post("/", authMiddleware, createTransaction);

// Get all transactions
router.get("/", authMiddleware, getAllTransactions);

// Dashboard stats (must be BEFORE /:id route)
router.get("/stats", authMiddleware, getSpendingStats);

// Fraud routes (must be BEFORE /:id route)
router.get("/flagged", authMiddleware, getFlaggedTransactions);

// Get single transaction
router.get("/:id", authMiddleware, getTransactionById);

// Update transaction
router.put("/:id", authMiddleware, updateTransaction);

// ✅ Delete transaction
router.delete("/:id", authMiddleware, deleteTransaction);

// Mark transaction as legitimate
router.patch("/:id/legitimate", authMiddleware, markTransactionLegitimate);

module.exports = router;
