/**
 * Transaction Controller
 * Handles creation and retrieval of user transactions
 */

const Transaction = require("../models/Transaction");

/**
 * Create a new transaction
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

    const transaction = await Transaction.create({
      userId: req.userId,
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

/**
 * Get all transactions for logged-in user
 * Supports pagination and filtering
 */
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type } = req.query;

    const offset = (page - 1) * limit;

    // Build filters dynamically
    const whereClause = {
      userId: req.userId,
    };

    if (category) {
      whereClause.category = category;
    }

    if (type) {
      whereClause.type = type;
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      totalTransactions: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      transactions: rows,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return res.status(500).json({
      message: "Server error while fetching transactions",
    });
  }
};

module.exports = { createTransaction, getAllTransactions };
