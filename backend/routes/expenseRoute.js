const express = require("express");
const router = express.Router();
const exController = require("../controllers/expenseController");

const authenticate = require("../middleware/authMiddleware");
router.use(authenticate);
router.post("/add", exController.addExpense);

router.get("/get", exController.getAllExpense);

router.delete("/delete/:id", exController.deleteExpense);

router.post("/getCategoryAI", exController.categoryAI);

router.get("/downloadExpenses", exController.downloadExpenses);

module.exports = router;
