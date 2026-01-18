/**
 * Sequelize database configuration
 * - Connects to PostgreSQL
 * - Tests the connection on startup
 */

const { Sequelize } = require("sequelize");
require("dotenv").config();

// Support both DATABASE_URL (production) and individual env vars (development)
let sequelize;
if (process.env.DATABASE_URL) {
  // Render/Heroku style connection string with SSL required
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
    }
  );
}

// Function to test DB connection
const connectDB = async () => {
  try {
    // In production with DATABASE_URL we just authenticate; local dev can still create DB if needed
    if (!process.env.DATABASE_URL && process.env.DB_NAME) {
      const adminSequelize = new Sequelize("postgres", process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: "postgres",
        logging: false,
      });

      await adminSequelize.authenticate();
      await adminSequelize.query(`CREATE DATABASE ${process.env.DB_NAME};`).catch(() => {
        // Database might already exist, ignore
      });
      await adminSequelize.close();
    }

    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // stop server if DB fails
  }
};

module.exports = { sequelize, connectDB };
