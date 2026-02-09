const expenseModel = require("../models/expenseModel");
const userModel = require("../models/userModel");
const aiService = require("../services/categoryAI");
const expenseFile = require("../services/expensesFile");
const sequelize = require("../utils/db-connection");

const addExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { amount, category, description, note } = req.body;

    const userId = req.user.userId;

    const user = await userModel.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }
    await user.createExpense(
      { amount, description, category, note },
      { transaction: t },
    );
    await user.increment("totalExpense", {
      by: Math.round(amount),
      transaction: t,
    });
    await t.commit();
    res.status(201).json({ message: "Expense added!" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const getAllExpense = async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const page = Math.max(Number(req.query.page) || 1, 1);
  const offset = (page - 1) * limit;

  try {
    const userId = req.user.userId;

    const user = await userModel.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User id not found" });
    }

    const expenseData = await user.getExpenses({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    const totalExpenses = await user.countExpenses();

    res.status(200).json({
      expenses: expenseData,
      currentPage: page,
      totalPages: Math.ceil(totalExpenses / limit),
      totalItems: totalExpenses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateExpense = async (req, res) => {
  const t = await sequelize.transaction();
  const { description, amount, id } = req.body;

  try {
    if (!description || amount == null || !id) {
      await t.rollback();
      return res.status(400).json({ message: "Missing required inputs" });
    }

    const oldExpense = await expenseModel.findByPk(id, { transaction: t });
    if (!oldExpense) {
      await t.rollback();
      return res.status(404).json({ message: "Expense not found" });
    }

    const user = await oldExpense.getUser({ transaction: t });

    user.totalExpense -= Number(oldExpense.amount);
    user.totalExpense += Number(amount);

    await user.save({ transaction: t });

    const [affectedRows] = await expenseModel.update(
      { description, amount },
      { where: { id }, transaction: t },
    );

    if (affectedRows < 1) {
      await t.rollback();
      return res.status(404).json({ message: "Expense not found" });
    }

    await t.commit();
    return res.status(200).json({ message: "Expense updated" });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const expense = await expenseModel.findOne({
      where: { id },
      transaction: t,
    });

    const user = await userModel.findByPk(expense.userId, { transaction: t });
    await user.decrement("totalExpense", {
      by: expense.amount,
      transaction: t,
    });

    await expenseModel.destroy({ where: { id }, transaction: t });
    await t.commit();
    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const categoryAI = async (req, res) => {
  try {
    const { description } = req.body;

    const response = await aiService.aiCategory(description);

    res.status(200).json({ category: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const downloadExpenses = async (req, res) => {
  try {
    const { userId } = req.user;
    const expenseData = await expenseModel.findAll({
      where: { userId: userId },
      attributes: ["description", "amount", "category", "note"],
    });

    const fileUrl = await expenseFile(expenseData, userId);

    res.status(200).json({ download: fileUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addExpense,
  getAllExpense,
  deleteExpense,
  categoryAI,
  downloadExpenses,
  updateExpense,
};
