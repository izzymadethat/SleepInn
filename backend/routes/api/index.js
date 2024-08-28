const router = require("express").Router();

const sessionRoutes = require("./sessions");
const spotsRoutes = require("./spots");
const usersRoutes = require("./users");

router.use("/sessions", sessionRoutes);
router.use("/spots", spotsRoutes);
router.use("/users", usersRoutes);

module.exports = router;
