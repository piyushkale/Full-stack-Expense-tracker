const sequelize = require("../utils/db-connection");
const { DataTypes } = require("sequelize");

const forgotPassword = sequelize.define("forgotPassword", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = forgotPassword;