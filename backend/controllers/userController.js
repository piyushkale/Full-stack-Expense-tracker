const { UniqueConstraintError } = require("sequelize");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

module.exports = { n_signup, n_login };
