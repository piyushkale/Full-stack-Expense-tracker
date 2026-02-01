const expenseModel = require("../models/expenseModel");
const userModel = require("../models/userModel");
const { Sequelize } = require("sequelize");

const getExpenseLeaderboard = async (req, res) => {
  try {
    const data = await userModel.findAll({
      attributes:['name','totalExpense'],
      order:[['totalExpense','DESC']]
    })
    // name, totalExpense
    res.status(200).json({ leaderboard: data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getExpenseLeaderboard };
