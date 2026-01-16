/**
 * Transaction Controller
 * Handles transaction CRUD and analytics
 */

const { Op, fn, col } = require("sequelize");
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
 * Get all transactions (pagination + filters)
 */
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.userId };

    if (category) whereClause.category = category;
    if (type) whereClause.type = type;

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

/**
 * Get spending statistics for dashboard
 */
const getSpendingStats = async (req, res) => {
  try {
    const userId = req.userId;

    // 1️⃣ Total spent (debit only)
    const totalSpentResult = await Transaction.findOne({
      where: {
        userId,
        type: "debit",
      },
      attributes: [[fn("SUM", col("amount")), "totalSpent"]],
      raw: true,
    });

    const totalSpent = parseFloat(totalSpentResult.totalSpent || 0);

    // 2️⃣ Spending by category
    const spendingByCategory = await Transaction.findAll({
      where: {
        userId,
        type: "debit",
      },
      attributes: [
        "category",
        [fn("SUM", col("amount")), "total"],
      ],
      group: ["category"],
      raw: true,
    });

    // 3️⃣ Monthly spending trend (last 6 months)
    const monthlySpending = await Transaction.findAll({
      where: {
        userId,
        type: "debit",
        createdAt: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        },
      },
      attributes: [
        [fn("DATE_TRUNC", "month", col("createdAt")), "month"],
        [fn("SUM", col("amount")), "total"],
      ],
      group: ["month"],
      order: [["month", "ASC"]],
      raw: true,
    });

    return res.status(200).json({
      totalSpent,
      spendingByCategory,
      monthlySpending,
    });
  } catch (error) {
    console.error("Spending stats error:", error);
    return res.status(500).json({
      message: "Server error while fetching spending statistics",
    });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getSpendingStats,
};
