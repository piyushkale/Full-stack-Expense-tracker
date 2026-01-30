const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
  },
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log(err.message);
  });


module.exports = sequelize;
