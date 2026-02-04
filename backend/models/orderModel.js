const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

const orderModel = sequelize.define("order", {
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
  orderId: { type: DataTypes.STRING, unique:true, allowNull: false },
  amount: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "PENDING" },
  userId: { type: DataTypes.STRING },
});


module.exports = orderModel
