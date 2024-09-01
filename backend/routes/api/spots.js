const express = require("express");
const router = express.Router();
const { Spot } = require("../../db/models");
const { User } = require("../../db/models");
const {requireAuth} = require("../../utils/auth");
const Sequelize = require('sequelize');


router.get('/:spotId', async(req,res, next) =>{
  const spotId = Number(req.params.spotId)
   console.log(spotId)



  try {
    const spot = await Spot.findOne({
      where: { id:spotId },
      include: [{
        model: User,
        where: { id: Sequelize.col('Spot.ownerId') },// Match User's id to Spot's ownerId
        attributes: ['id', 'firstName', 'lastName']
      }]
    });
   if (!spot) {
    //spot not found
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  res.json(spot);
  } catch(e){
    res.status(500)
    console.error(e);
    next(e);
  }
})

router.get('/owner/:ownerId', requireAuth , async(req,res, next) =>{
  const ownerId = Number(req.params.ownerId)
  try{
    const allSpots = await Spot.findAll({
    where:{ownerId}
  })

  res.json(allSpots);
  } catch(e){
    res.status(500)
    console.error(e);
    next(e);
  }
})

// get all spots
router.get('/', async (req,res)=>{
  try{
   const allSpots = await Spot.findAll()
   res.json(allSpots)
  }catch(e){
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
})


module.exports = router;
