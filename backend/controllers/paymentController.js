const Cashfree = require("../config/cashfree");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const {userId} = req.user;
    const orderId = "ORDER_" + Date.now();

    const request = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: "USER_123",
        customer_email: "test@gmail.com",
        customer_phone: "9999999999",
      },
      order_meta: {
        return_url: "http://localhost:3000/expense.html?order_id={order_id}",
      },
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    // create new order in OrderTable also use userId as foreign key
    await orderModel.create({ orderId, amount: request.order_amount, userId });

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log("Cashfree Error FULL:", error);
    console.log("Cashfree Error DATA:", error.response?.data);
    console.log("Cashfree Error MESSAGE:", error.message);

    res.status(500).json({
      error: error.response?.data || error.message || "Payment order failed",
    });
  }
};

exports.paymentVerify = async (req, res) => {
  try {
    const { orderId } = req.params;

    const response = await Cashfree.PGFetchOrder("2023-08-01", orderId);
    const orderStatus = response.data.order_status;

    const order = await orderModel.findOne({ where: { orderId } });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update order status ALWAYS
    await orderModel.update({ status: orderStatus }, { where: { orderId } });

    // Upgrade user ONLY once
    if (orderStatus === "PAID" && order.status !== "PAID") {
      await userModel.update(
        { isPremium: true },
        { where: { id: order.userId } },
      );
    }

    res.status(200).json({ status: orderStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payment verification failed" });
  }
};
