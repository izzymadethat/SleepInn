const router = require("express").Router();
const { requireAuth } = require("../../utils/auth");
const { Booking , Spot} = require("../../db/models");




router.delete("/:bookingId", requireAuth, async (req, res, next) => {
    const userId = req.user.id
    const bookingId = Number(req.params.bookingId)
    console.log(typeof bookingId)
    try{
          const booking = await Booking.findByPk(bookingId, {
    include:{
        model:Spot,
        attributes:['ownerId']
    }
    })

    if(!booking){
        return res.status(404).json({message:" booking not found"})
    }
    const currentDate = new Date()
    if(currentDate >= booking.startDate){
      return  res.status(403).json({message:"Bookings that have been started can't be deleted"})
    }
    if(userId !== booking.userId && booking.Spot.ownerId !== userId){
       return res.status(403).json({message:"user unauthorized to delete this booking"})
    }
    await booking.destroy()
   return res.status(200).json({message:"succesfully deleted"})
    }catch(e){
        e.status = 500
        next(e)
    }


})


module.exports = router
