const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User } = require("../../db/models");

// middleware to validate signup
const validateSignup = [
  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a lastName."),
  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a firstName."),
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email."),
  check("username")
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage("Please provide a username with at least 4 characters."),
  check("username").not().isEmail().withMessage("Username cannot be an email."),
  check("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more."),
  handleValidationErrors
];

// Sign up
router.post("/", validateSignup, async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;
  const errors = {};

  // Check for existing email
  const existingUserByEmail = await User.findOne({ where: { email } });
  if (existingUserByEmail) {
    errors.email = "Email is already taken.";
  }

  // Check for existing username
  const existingUserByUsername = await User.findOne({ where: { username } });
  if (existingUserByUsername) {
    errors.username = "Username is already taken.";
  }

  // If there are errors, respond with them
  if (Object.keys(errors).length > 0) {
    const err = Error("Validation error.");
    err.errors = errors;
    err.status = 400;
    return res.status(400).json(err);
  }
  const hashedPassword = bcrypt.hashSync(password);
  const user = await User.create({
    email,
    username,
    hashedPassword,
    firstName,
    lastName
  });

  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName
  };

  await setTokenCookie(res, safeUser);

  return res.json({
    user: safeUser
  });
});

module.exports = router;
