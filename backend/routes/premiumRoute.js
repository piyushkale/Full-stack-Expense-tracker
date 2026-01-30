const express = require("express");
const router = express.Router();
const premiumController = require("../controllers/premiumController");

router.get("/leaderboard", premiumController.getExpenseLeaderboard);
console.log("Premium route is hit")
module.exports = router;
