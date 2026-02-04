const user = require("../models/userModel");
const expense = require("../models/expenseModel");
const forgotPassword = require("../models/forgotPasswordModel");

user.hasMany(expense, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  hooks: true,
});

expense.belongsTo(user, {
  foreignKey: "userId",
});

user.hasMany(forgotPassword, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  hooks: true,
});

forgotPassword.belongsTo(user, {
  foreignKey: "userId",
});

module.exports = { user, expense, forgotPassword };