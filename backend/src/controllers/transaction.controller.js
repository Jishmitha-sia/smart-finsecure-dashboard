/**
 * Transaction Controller
 * Handles transaction CRUD, analytics, and fraud management
 */

const { Op, fn, col } = require("sequelize");
const axios = require("axios");
const Transaction = require("../models/Transaction");

// Helper: encode category string to numeric feature
const encodeCategory = (category) => {
  if (!category) return 0;
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return hash % 10; // small bucketed encoding
};

// Helper: compute feature set for ML scoring
const computeFeatures = async (userId, txInput) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Merchant frequency for this user
  const merchantFreq = txInput.merchant
    ? await Transaction.count({
        where: { userId, merchant: txInput.merchant },
      })
    : 0;

  // Recent transactions to compute amount deviation
  const recentTx = await Transaction.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    limit: 20,
    attributes: ["amount", "createdAt"],
  });
  const avgAmount =
    recentTx.length > 0
      ? recentTx.reduce((sum, t) => sum + (t.amount || 0), 0) / recentTx.length
      : txInput.amount || 0;
  const amountDeviation = Math.abs((txInput.amount || 0) - avgAmount);

  // Velocity: number of transactions in last hour
  const velocity = await Transaction.count({
    where: {
      userId,
      createdAt: { [Op.gte]: oneHourAgo },
    },
  });

  return {
    amount: Number(txInput.amount || 0),
    hour: now.getHours(),
    category: encodeCategory(txInput.category),
    merchant_freq: merchantFreq,
    amount_deviation: Number(amountDeviation),
    velocity: velocity,
  };
};

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

    // ML scoring
    let fraudScore = 0;
    let isFraudulent = false;
    try {
      if (process.env.ML_API_URL) {
        const features = await computeFeatures(req.userId, {
          amount,
          category,
          merchant,
        });
        const { data } = await axios.post(process.env.ML_API_URL, features, {
          timeout: 3000,
        });
        fraudScore = Number(data?.fraudScore || 0);
        isFraudulent = Boolean(data?.isFraud || false);
      }
    } catch (mlErr) {
      console.error("ML scoring error:", mlErr.message);
      // proceed without blocking transaction creation
    }

    const transaction = await Transaction.create({
      userId: req.userId,
      amount,
      category,
      type,
      description,
      merchant,
      location,
      isFraudulent,
      fraudScore,
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
    const { page = 1, limit = 10, category, type, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.userId };
    if (category) whereClause.category = category;
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

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
 * Get single transaction
 */
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.userId },
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    return res.status(200).json({ transaction });
  } catch (error) {
    console.error("Get transaction error:", error);
    return res.status(500).json({
      message: "Server error while fetching transaction",
    });
  }
};

/**
 * Update transaction
 */
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.userId },
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    const {
      amount,
      category,
      type,
      description,
      merchant,
      location,
      status,
    } = req.body;

    if (amount !== undefined) transaction.amount = amount;
    if (category) transaction.category = category;
    if (type && ["debit", "credit"].includes(type)) transaction.type = type;
    if (description !== undefined) transaction.description = description;
    if (merchant !== undefined) transaction.merchant = merchant;
    if (location !== undefined) transaction.location = location;
    if (status) transaction.status = status;

    await transaction.save();

    return res.status(200).json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error);
    return res.status(500).json({
      message: "Server error while updating transaction",
    });
  }
};

/**
 * ✅ Delete transaction
 */
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.userId },
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    await transaction.destroy();

    return res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return res.status(500).json({
      message: "Server error while deleting transaction",
    });
  }
};

/**
 * Get spending statistics
 */
const getSpendingStats = async (req, res) => {
  try {
    const userId = req.userId;

    const totalSpentResult = await Transaction.findOne({
      where: { userId, type: "debit" },
      attributes: [[fn("SUM", col("amount")), "totalSpent"]],
      raw: true,
    });

    const totalSpent = parseFloat(totalSpentResult.totalSpent || 0);

    const spendingByCategory = await Transaction.findAll({
      where: { userId, type: "debit" },
      attributes: ["category", [fn("SUM", col("amount")), "total"]],
      group: ["category"],
      raw: true,
    });

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

/**
 * Get flagged transactions
 */
const getFlaggedTransactions = async (req, res) => {
  try {
    const flaggedTransactions = await Transaction.findAll({
      where: { userId: req.userId, isFraudulent: true },
      order: [["fraudScore", "DESC"]],
    });

    return res.status(200).json({ flaggedTransactions });
  } catch (error) {
    console.error("Get flagged transactions error:", error);
    return res.status(500).json({
      message: "Server error while fetching flagged transactions",
    });
  }
};

/**
 * Mark transaction legitimate
 */
const markTransactionLegitimate = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.userId },
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    transaction.isFraudulent = false;
    transaction.fraudScore = 0;
    await transaction.save();

    return res.status(200).json({
      message: "Transaction marked as legitimate",
      transaction,
    });
  } catch (error) {
    console.error("Mark legitimate error:", error);
    return res.status(500).json({
      message: "Server error while updating transaction",
    });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction, // ✅ new
  getSpendingStats,
  getFlaggedTransactions,
  markTransactionLegitimate,
};
