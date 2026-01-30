const user = require("../models/userModel");
const expense = require("../models/expenseModel");

user.hasMany(expense, {
  foreignKey: "userId",
  onDelete: "CASCADE",   
  hooks: true       
});

expense.belongsTo(user, {
  foreignKey: "userId",
});

module.exports = { user, expense };
