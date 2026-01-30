require('dotenv').config();
const express = require("express");
const path = require("path");
const db = require("./utils/db-connection");
const userRoute = require("./routes/userRoute");
const paymentRoute = require('./routes/paymentRoute')
const expenseRoute = require("./routes/expenseRoute");
const app = express();
require("./models");

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/user", userRoute);

app.use("/expense", expenseRoute);

app.use('/payment',paymentRoute)

db.sync({ alter: true })
  .then(() => {
    console.log("All models attached to db are synced");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.listen(3000, (err) => {
  if (err) {
    console.log(err.message);
    return;
  }
  console.log("Server is running");
});
