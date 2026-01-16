/**
 * Dashboard Controller
 * Provides summary data for dashboard view
 */

const User = require("../models/User");
const Transaction = require("../models/Transaction");

/**
 * Get dashboard summary
 */
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user balance
    const user = await User.findByPk(userId, {
      attributes: ["accountBalance"],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get recent transactions (last 5)
    const recentTransactions = await Transaction.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    // Get fraud alert count
    const fraudAlertCount = await Transaction.count({
      where: {
        userId,
        isFraudulent: true,
      },
    });

    return res.status(200).json({
      balance: user.accountBalance,
      recentTransactions,
      fraudAlertCount,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return res.status(500).json({
      message: "Server error while fetching dashboard summary",
    });
  }
};

module.exports = { getDashboardSummary };
