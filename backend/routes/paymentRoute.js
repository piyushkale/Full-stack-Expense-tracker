const express = require("express");
const router = express.Router();
const {
  createOrder,
  paymentVerify,
} = require("../controllers/paymentController");
const Authenticate = require("../middleware/authMiddleware");

router.post("/create-order", Authenticate, createOrder);

router.get("/verify/:orderId", paymentVerify);

module.exports = router;
