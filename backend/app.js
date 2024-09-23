// Imports
const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const csurf = require("csurf");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { ValidationError } = require("sequelize");
const routes = require("./routes");

// check the current environment
const { environment } = require("./config");
const isProduction = environment === "production";

const app = express();

// middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security Middleware
if (!isProduction) {
  // enable cors only in development
  app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true,
    },
  })
);

// use all routes after middleware has been created
app.use(routes);

// ============ Error handlers ==============

// catch all unhandled requests and forward to error handler.
// If this resource-not-found middleware is called, an error will be created with the message "The requested resource couldn't be found."
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;
  next(err);
});

// catch and process any Sequelize errors
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = "Validation error";
    err.errors = errors;
  }
  next(err);
});

// Error formatting
/*
formatting all the errors before returning a JSON response. It will include the error message, the error messages as a JSON object with key-value pairs, and the error stack trace (if the environment is in development) with the status code of the error message.
*/
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);

  if (isProduction) {
    res.json({
      message: err.message,
      errors: err.errors,
    });
  } else {
    res.json({
      title: err.title || "Server Error",
      message: err.message,
      errors: err.errors,
      stack: err.stack,
    });
  }
});

process.on("SIGINT", () => {
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

module.exports = app;
