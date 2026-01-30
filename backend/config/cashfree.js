const { Cashfree } = require("cashfree-pg");

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment = "SANDBOX"; // use PRODUCTION later

module.exports = Cashfree;
