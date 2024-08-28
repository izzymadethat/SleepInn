const express = require('express');
const router = express.Router();
const requireAuth = require('../utils/auth');
const {Spot}= require('../db/models')

router.post("/", requireAuth, async (req, res) => {
//   const spot = await
})

module.exports = router
