// This file serves as the main file to export all routes

const express = require("express");
const apiRouter = require("./api");
const router = express.Router();

// handle all routes beginning with /api
router.use("/api", apiRouter);

/* 
    Restore a user token upon request
    This route will provide a csrf that will be added to a
    user's cookies
*/
router.get("/api/csrf/restore", (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200).json({
    "XSRF-Token": csrfToken,
  });
});

module.exports = router;
