const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/signup", userController.n_signup);

router.post("/login",userController.n_login)

module.exports = router