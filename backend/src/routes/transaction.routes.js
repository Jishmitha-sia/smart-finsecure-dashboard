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

// Get single transaction
router.get("/:id", authMiddleware, getTransactionById);

// Update transaction
router.put("/:id", authMiddleware, updateTransaction);

// ✅ Delete transaction
router.delete("/:id", authMiddleware, deleteTransaction);

// Dashboard stats
router.get("/stats", authMiddleware, getSpendingStats);

// Fraud routes
router.get("/flagged", authMiddleware, getFlaggedTransactions);
router.patch("/:id/legitimate", authMiddleware, markTransactionLegitimate);

module.exports = router;
