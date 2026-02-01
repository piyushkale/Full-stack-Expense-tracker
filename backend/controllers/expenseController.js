const expenseModel = require("../models/expenseModel");
const userModel = require("../models/userModel");

const addExpense = async (req, res) => {
  try {
    const { amount, category, description } = req.body;

    const userId = req.user.userId;

    const user = await userModel.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.createExpense({ amount, description, category });
    await user.increment("totalExpense", { by: Math.round(amount) });
    res.status(201).json({ message: "Expense added!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllExpense = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await userModel.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User id not found" });
    }

    const expenseData = await user.getExpenses();

    res.status(200).json(expenseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await expenseModel.findOne({ where: { id } });
    const user = await userModel.findByPk(expense.userId);
    await user.decrement("totalExpense", { by: expense.amount });
  
    await expenseModel.destroy({ where: { id } });
    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addExpense, getAllExpense, deleteExpense };
