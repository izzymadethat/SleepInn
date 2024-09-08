const router = require("express").Router();
const { requireAuth } = require("../../utils/auth");
const { Booking, Spot } = require("../../db/models");
const { route } = require("./reviews");
const { spotAttributes } = require("../../utils/attributes");

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

router.get("/", requireAuth, async (req, res, next) => {
  const uid = req.user.id;

  try {
    const bookings = await Booking.findAll({
      where: { userId: uid },
      include: [
        {
          model: Spot,
          attributes: spotAttributes,
        },
      ],
    });

    return res.json({ Bookings: bookings });
  } catch (error) {
    next(error);
  }
});

/*
========================================
   edit a booking
========================================
*/

router.put(
  "/:bookingId",
  requireAuth,
  validateBooking,
  async (req, res, next) => {
    const userId = req.user.id;
    const bookingId = Number(req.params.bookingId);
    const { spotId, startDate, endDate } = req.body;
    try {
      const booking = await Booking.findByPk(bookingId);

      if (!booking) {
        const err = new Error("Booking couldn't be found");
        err.status = 404;
        next(err);
      }

      // check if user is the originator of the booking
      if (booking.userId !== userId) {
        const err = new Error("Forbidden");
        err.status = 403;
        next(err);
      }

      //   bookings in the past can't be updated
      const currentDate = new Date();
      if (currentDate >= booking.startDate) {
        const err = new Error(
          "Bookings that have been started can't be updated"
        );
        err.status = 403;
        next(err);
      }

      // Check for booking conflicts
      const conflictingBookings = await Booking.findAll({
        where: {
          spotId: booking.spotId,
          id: { [Op.ne]: bookingId },
          [Op.or]: [
            { startDate: { [Op.between]: [startDate, endDate] } },
            { endDate: { [Op.between]: [startDate, endDate] } },
          ],
        },
      });

      if (conflictingBookings.length > 0) {
        return res.status(403).json({
          message: "Booking conflict",
          errors: {
            startDate: "Start date conflicts with an existing booking",
            endDate: "End date conflicts with an existing booking",
          },
        });
      }

      await booking.update({ spotId, startDate, endDate });
      return res.status(200).json(booking);
    } catch (e) {
      next(e);
    }
  }
);

router.delete("/:bookingId", requireAuth, async (req, res, next) => {
  const userId = req.user.id;
  const bookingId = Number(req.params.bookingId);

  try {
    const booking = await Booking.findByPk(bookingId, {
      include: {
        model: Spot,
        attributes: ["ownerId"],
      },
    });

    if (!booking) {
      const err = new Error("Booking couldn't be found");
      err.status = 404;
      next(err);
    }

    // check if user is the originator of the booking or the user is the owner of the spot
    if (booking.userId !== userId && booking.Spot.ownerId === userId) {
      const err = new Error("Forbidden");
      err.status = 403;
      next(err);
    }

    // Bookings that have been started can't be deleted
    const currentDate = new Date();
    if (currentDate >= booking.startDate) {
      const err = new Error("Bookings that have been started can't be deleted");
      err.status = 403;
      next(err);
    }

    await booking.destroy();
    return res.status(200).json({ message: "Successfully deleted" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
