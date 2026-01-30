const expenseModel = require("../models/expenseModel");
const userModel = require("../models/userModel");
const { Sequelize } = require("sequelize");

const getExpenseLeaderboard = async (req, res) => {
  try {
    const data = await expenseModel.findAll({
      attributes: [
        "userId",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "totalExpense"],
      ],
      include: [{ model: userModel, attributes: ["name"] }],
      group: ["userId", "user.id"],
      order: [[Sequelize.literal("totalExpense"), "DESC"]],
    });

    res.status(200).json({ leaderboard: data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getExpenseLeaderboard };
