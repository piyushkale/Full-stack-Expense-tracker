const sequelize = require("../utils/db-connection");
const { DataTypes } = require("sequelize");

const expenseModel = sequelize.define("expense", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amount: DataTypes.STRING,
  description: DataTypes.STRING,
  category: DataTypes.STRING,
});

module.exports = expenseModel;
