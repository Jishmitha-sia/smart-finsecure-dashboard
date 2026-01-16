/**
 * Transaction model
 * Represents financial transactions of a user
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("debit", "credit"),
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    merchant: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    isFraudulent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    fraudScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.ENUM("pending", "completed"),
      defaultValue: "completed",
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
  }
);

// Relationships
User.hasMany(Transaction, { foreignKey: "userId" });
Transaction.belongsTo(User, { foreignKey: "userId" });

module.exports = Transaction;
