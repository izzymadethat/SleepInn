const express = require('express');
const router = express.Router();
  router.get('/',(req,res,next)=>{
    res.send('sessions routes hosted here')
  })


module.exports = router
