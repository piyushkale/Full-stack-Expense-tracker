const { UniqueConstraintError, json } = require("sequelize");
const userModel = require("../models/userModel");
const fPasswordModel = require("../models/forgotPasswordModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sibEmail = require("../services/sibEmail");
const sequelize = require("../utils/db-connection");

const SALT_ROUNDS = 10;
const n_signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Adding to user model if signup is successful
    await userModel.create({
      name,
      email: normalizedEmail,
      password: hashPassword,
    });
    res
      .status(201)
      .json({ message: `Account created successfully ${normalizedEmail}` });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res
        .status(409)
        .json({ error: "Account already exist with this email!" });
    }
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ error: error.errors[0].message });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

const n_login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userModel.findOne({ where: { email: normalizedEmail } });
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Incorrect password");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.status(200).json({ success: true, token: token });
  } catch (error) {
    if (error.message === "User not found") {
      res.status(401).json({ error: "User not found" });
      return;
    }
    if (error.message === "Incorrect password") {
      res.status(401).json({ error: "User not authorized" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

const get_user = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await userModel.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ isPremium: user.isPremium, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const forgetPassword = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ where: { email }, transaction: t });
    if (!user) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Account doesnt exist with this email" });
    }
    const resetRequest = await fPasswordModel.create(
      { userId: user.id },
      { transaction: t },
    );
    await t.commit();

    // calling sib email service by passing email and uuid
    await sibEmail(email.toLowerCase().trim(), resetRequest.id);
    res.status(200).json({ message: `Email sent to ${email}` });
  } catch (error) {
    await t.rollback();
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  console.log('backend hit')
  const t = await sequelize.transaction();
  try {
    const { uuid, password } = req.body;
    const uuidRequest = await fPasswordModel.findOne({
      where: { id: uuid, isActive: true },
      transaction: t,
    });
    if (!uuidRequest) {
      await t.rollback();
      return res.status(404).json({ message: "Invalid credentials" });
    }
    const user = await userModel.findByPk(uuidRequest.userId, {
      transaction: t,
    });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "Invalid credentials" });
    }
    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);
    user.password = hashPassword;
    uuidRequest.isActive = false;
    await uuidRequest.save({ transaction: t });
    await user.save({ transaction: t });
    await t.commit();
    res.status(200).json({ message: "Password changed" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

module.exports = { n_signup, n_login, get_user, forgetPassword, resetPassword };
