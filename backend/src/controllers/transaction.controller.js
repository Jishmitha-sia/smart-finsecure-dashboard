/**
 * Transaction Controller
 * Handles creation of user transactions
 */

const Transaction = require("../models/Transaction");

/**
 * Create a new transaction
 * - Requires authentication
 * - Automatically attaches userId from JWT
 */
const createTransaction = async (req, res) => {
  try {
    const {
      amount,
      category,
      type,
      description,
      merchant,
      location,
    } = req.body;

    // Basic validation
    if (!amount || !category || !type) {
      return res.status(400).json({
        message: "Amount, category, and type are required",
      });
    }

    if (!["debit", "credit"].includes(type)) {
      return res.status(400).json({
        message: "Transaction type must be debit or credit",
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.userId, // from JWT middleware
      amount,
      category,
      type,
      description,
      merchant,
      location,
    });

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    return res.status(500).json({
      message: "Server error while creating transaction",
    });
  }
};

module.exports = { createTransaction };
