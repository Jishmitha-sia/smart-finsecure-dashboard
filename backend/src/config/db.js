/**
 * Sequelize database configuration
 * - Connects to PostgreSQL
 * - Tests the connection on startup
 */

const { Sequelize } = require("sequelize");
require("dotenv").config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false, // keep console clean
  }
);

// Function to test DB connection
const connectDB = async () => {
  try {
    // First, try to connect to the default postgres database to create our DB if needed
    const adminSequelize = new Sequelize("postgres", process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
    });

    await adminSequelize.authenticate();
    
    // Create database if it doesn't exist
    await adminSequelize.query(`CREATE DATABASE ${process.env.DB_NAME};`).catch(() => {
      // Database might already exist, that's fine
    });
    
    await adminSequelize.close();

    // Now connect to our actual database
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // stop server if DB fails
  }
};

module.exports = { sequelize, connectDB };
