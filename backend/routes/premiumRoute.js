const express = require("express");
const router = express.Router();
const premiumController = require("../controllers/premiumController");

router.get("/leaderboard", premiumController.getExpenseLeaderboard);

module.exports = router;
