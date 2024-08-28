// Utility functions to aid in authentication
const jwt = require("jsonwebtoken");
const { jwtConfig } = require("../config");
const { User } = require("../db/models");

const { secret, expiresIn } = jwtConfig;

/**
 * Creates a JWT cookie after the user is logged in or
 * signed up.
 * The payload of the JWT will be the user's id, username, and email attributes. Do NOT add the user's hashedPassword attribute to the payload
 * @param {Response} res - the response object
 * @param {User} user - the User instance to authenticate
 * @returns {string} - The value of the jwt token
 */
const setTokenCookie = (res, user) => {
  // Create the token.
  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
  };
  const token = jwt.sign(
    { data: safeUser },
    secret,
    { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
  );

  const isProduction = process.env.NODE_ENV === "production";

  // Set the token cookie
  res.cookie("token", token, {
    maxAge: expiresIn * 1000, // maxAge in milliseconds
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction && "Lax",
  });

  return token;
};

/**
 * The restoreUser middleware will be connected to the API router so that all API route handlers will check if there is a current user logged in or not.
 * If there is a User found in the search, then save the user to a key of user onto the Request (req.user). If there is an error verifying the JWT or a User cannot be found with the id in the JWT payload, then clear the token cookie from the response and set req.user to null.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns {void}
 */

const restoreUser = (req, res, next) => {
  // token parsed from cookies
  const { token } = req.cookies;
  req.user = null;

  return jwt.verify(token, secret, null, async (err, jwtPayload) => {
    if (err) {
      return next();
    }

    try {
      const { id } = jwtPayload.data;
      req.user = await User.findByPk(id, {
        attributes: {
          include: [
            "id",
            "email",
            "firstName",
            "lastName",
            "createdAt",
            "updatedAt",
          ],
        },
      });
    } catch (e) {
      res.clearCookie("token");
      return next();
    }

    if (!req.user) res.clearCookie("token");

    return next();
  });
};

/**
 * Passes error to error handling middleware from every route that requires authentication and a user is not logged in
 * @param {Request} req - The request object
 * @param {Response} _res -response object (not needed)
 * @param {Function} next - The middleware to handle the error
 * @returns {void}
 */
const requireAuth = function (req, _res, next) {
  if (req.user) return next();

  const err = new Error("Authentication required");
  err.title = "Authentication required";
  err.errors = { message: "Authentication required" };
  err.status = 401;
  return next(err);
};

module.exports = { setTokenCookie, restoreUser, requireAuth };
