const router = require("express").Router({ mergeParams: true });
const { requireAuth } = require("../../utils/auth");
const { Booking, Spot } = require("../../db/models");
const { check } = require("express-validator");
const { spotAttributes } = require("../../utils/attributes");
const { handleValidationErrors } = require("../../utils/validation");
const { Op, Sequelize } = require("sequelize");

const validateBooking = [
  check("startDate")
    .exists({ checkFalsy: true })
    .custom((value, { req }) => {
      const today = new Date();
      const start = new Date(value);
      if (start < today) {
        throw new Error("startDate cannot be in the past");
      }
      return true;
    }),
  check("endDate")
    .exists({ checkFalsy: true })
    .custom((value, { req }) => {
      const start = new Date(req.body.startDate);
      const end = new Date(value);
      if (end <= start) {
        throw new Error("End date cannot be on or before start date");
      }
      return true;
    }),
  handleValidationErrors,
];

/*
========================================
    get all bookings for the current user
========================================
*/

router.get("/current", requireAuth, async (req, res, next) => {
  const userId = req.user.id;

  try {
    const bookings = await Booking.findAll({
      where: { userId: userId },
      include: [
        {
          model: Spot,
          attributes: [
            "id",
            "ownerId",
            "address",
            "city",
            "state",
            "country",
            "lat",
            "lng",
            "name",
            "price",
          ],
          include: [
            {
              model: SpotImage,
              attributes: ["url", "preview"],
            },
          ],
        },
      ],
    });
    let bookingsList = [];

    bookings.forEach((booking) => {
      const bookingJSON = booking.toJSON();

      bookingJSON.Spot.SpotImages.forEach((image) => {
        if (image.preview === true) {
          bookingJSON.Spot.previewImage = image.url;
        }
      });

      if (!bookingJSON.Spot.previewImage) {
        bookingJSON.Spot.previewImage = "No preview image available";
      }

      delete bookingJSON.Spot.SpotImages;

      // Format the dates to only include the date part (YYYY-MM-DD)
      const formattedBooking = {
        id: bookingJSON.id,
        spotId: bookingJSON.spotId,
        Spot: {
          id: bookingJSON.Spot.id,
          ownerId: bookingJSON.Spot.ownerId,
          address: bookingJSON.Spot.address,
          city: bookingJSON.Spot.city,
          state: bookingJSON.Spot.state,
          country: bookingJSON.Spot.country,
          lat: bookingJSON.Spot.lat,
          lng: bookingJSON.Spot.lng,
          name: bookingJSON.Spot.name,
          price: bookingJSON.Spot.price,
          previewImage: bookingJSON.Spot.previewImage,
        },
        userId: bookingJSON.userId,
        // Use toISOString().split('T')[0] to get the date in YYYY-MM-DD format
        startDate: bookingJSON.startDate.toISOString().split("T")[0],
        endDate: bookingJSON.endDate.toISOString().split("T")[0],
        createdAt: bookingJSON.createdAt,
        updatedAt: bookingJSON.updatedAt,
      };

      bookingsList.push(formattedBooking);
    });

    res.status(200).json({ Bookings: bookingsList });
  } catch (error) {
    next(error);
  }
});

// ==========================================
//  Edit a booking
// ==========================================

router.put("/:bookingId", requireAuth, async (req, res, next) => {
  const userId = req.user.id;
  const bookingId = req.params.bookingId;

  const { startDate, endDate } = req.body;

  try {
    // Find the booking by its ID
    const booking = await Booking.findByPk(bookingId);

    // If booking doesn't exist, return 404
    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }

    // Check if the booking belongs to the current user
    if (booking.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: Booking doesn't belong to the user" });
    }

    // Prevent updates if the booking has already started
    const currentDate = new Date();
    if (currentDate >= new Date(booking.startDate)) {
      return res
        .status(403)
        .json({ message: "Bookings that have started can't be updated" });
    }

    // Check if endDate is before startDate
    if (new Date(endDate) <= new Date(startDate)) {
      return res
        .status(400)
        .json({ message: "End date cannot be before the start date" });
    }

    // Check for booking conflicts with other bookings
    const conflictingBookings = await Booking.findAll({
      where: {
        spotId: booking.spotId,
        id: { [Op.ne]: bookingId }, // Exclude the current booking
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
        ],
      },
    });

    // If there are conflicts, return 403
    if (conflictingBookings.length > 0) {
      return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking",
        },
      });
    }

    // Update the booking with the new dates
    await booking.update({ startDate, endDate });
    await booking.save();
    // Return the updated booking with a 200 status
    return res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
});

// ==========================================
//  Delete a booking
// ==========================================
router.delete("/:bookingId", requireAuth, async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  try {
    const booking = await Booking.findOne({
      where: { id: bookingId },
      include: {
        model: Spot,
        attributes: ["ownerId"],
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }

    // // Bookings in the past or have already started can't be deleted
    // // I think this should be checked for first before checking auth
    // const today = new Date();
    // const bookingStartDate = new Date(booking.startDate);
    // if (bookingStartDate <= today) {
    //   return res.status(403).json({
    //     message: "Bookings that have been started can't be deleted",
    //   });
    // }

    // Bookings can only be deleted by owner of the spot or the creator of the booking
    if (booking.Spot.ownerId !== userId && booking.userId !== userId) {
      return res.status(403).json({
        message: "Forbidden: Booking doesn't belong to the user",
      });
    }

    await booking.destroy();

    return res.status(200).json({ message: "Successfully deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
