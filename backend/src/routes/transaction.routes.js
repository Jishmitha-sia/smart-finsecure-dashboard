/**
 * Transaction routes
 */

const express = require("express");
const {
  createTransaction,
  getAllTransactions,
} = require("../controllers/transaction.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Create transaction
router.post("/", authMiddleware, createTransaction);

// Get all transactions (with pagination & filters)
router.get("/", authMiddleware, getAllTransactions);

module.exports = router;
