const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");

router.post("/signup", userController.n_signup);

router.post("/login", userController.n_login);

router.get("/userDetail", authenticate, userController.get_user);

module.exports = router;
