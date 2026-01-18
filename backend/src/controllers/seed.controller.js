/**
 * Seed Controller
 * Populates database with demo user and sample transactions
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const seedDatabase = async (req, res) => {
  try {
    // Check if demo user exists
    let user = await User.findOne({ where: { email: 'demo@example.com' } });

    if (!user) {
      // Create demo user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Demo@1234', salt);

      user = await User.create({
        name: 'Demo User',
        email: 'demo@example.com',
        password: hashedPassword,
        accountBalance: 5000,
      });
    }

    // Clear existing transactions for demo user
    await Transaction.destroy({ where: { userId: user.id } });

    // Sample transaction data
    const categories = ['groceries', 'transport', 'shopping', 'bills', 'entertainment', 'healthcare', 'salary', 'other'];
    const merchants = ['Whole Foods', 'Uber', 'Amazon', 'Netflix', 'Starbucks', 'CVS', 'Target', 'Shell Gas', 'Trader Joe\'s', 'DoorDash', 'Spotify', 'Gym Membership', 'Apple Store', 'Walmart', 'Costco'];
    const locations = ['NYC', 'San Francisco', 'Austin', 'Boston', 'Seattle', 'Denver', 'Miami', 'Chicago'];

    const transactions = [];
    const now = new Date();

    // Generate 25 sample transactions
    for (let i = 0; i < 25; i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      const amount = Math.random() < 0.2 ? Math.random() * 3000 + 500 : Math.random() * 150 + 5; // 20% high-value
      const category = categories[Math.floor(Math.random() * categories.length)];
      const type = Math.random() < 0.85 ? 'debit' : 'credit';
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];

      // 15% chance of fraud flag for demo
      const isFraudulent = Math.random() < 0.10;
      // Ensure fraud score is within 0-100
      const fraudScoreRaw = isFraudulent ? Math.floor(Math.random() * 30 + 70) : Math.floor(Math.random() * 20);
      const fraudScore = Math.min(fraudScoreRaw, 100);

      transactions.push({
        userId: user.id,
        amount: parseFloat(amount.toFixed(2)),
        category,
        type,
        description: `${merchant} purchase`,
        merchant,
        location,
        isFraudulent,
        fraudScore,
        status: 'completed',
        createdAt,
        updatedAt: createdAt,
      });
    }

    await Transaction.bulkCreate(transactions);

    return res.status(200).json({
      message: 'Database seeded successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        accountBalance: user.accountBalance,
      },
      credentials: {
        email: 'demo@example.com',
        password: 'Demo@1234',
      },
      transactionsCreated: transactions.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({
      message: 'Seed failed',
      error: error.message,
    });
  }
};

module.exports = { seedDatabase };
