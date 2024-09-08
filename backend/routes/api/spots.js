const express = require("express");
const router = express.Router();
const { Spot, User, Booking, SpotImage } = require("../../db/models");

const { requireAuth } = require("../../utils/auth");
const Sequelize = require("sequelize");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { userAttributes, imageAttributes } = require("../../utils/attributes");

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

const validateSpot = [
  check("address")
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"), // 400
  check("city").exists({ checkFalsy: true }).withMessage("City is required"), // 400
  check("state").exists({ checkFalsy: true }).withMessage("State is required"), // 400
  check("country")
    .exists({ checkFalsy: true })
    .withMessage("Country is required"), // 400
  check("lat")
    .exists({ checkFalsy: true })
    .isDecimal({ min: -90, max: 90 })
    .withMessage("Latitude must be within -90 and 90"),
  check("lng")
    .exists({ checkFalsy: true })
    .isDecimal({ min: -180, max: 180 })
    .withMessage("Longitude must be within -180 and 180"),
  check("name")
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),
  check("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check("price")
    .exists({ checkFalsy: true })
    .isDecimal({ min: 0 })
    .withMessage("Price per day must be a positive number"),
  handleValidationErrors,
];

const validateQueryParams = [
  check("page")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Page must be greater than or equal to 1"),
  check("size")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 20 })
    .withMessage("Size must be greater than or equal to 1"),
  check("minLat")
    .optional({ checkFalsy: true })
    .isDecimal({ min: -90, max: 90 })
    .withMessage("Minimum latitude is invalid"),
  check("maxLat")
    .optional({ checkFalsy: true })
    .isDecimal({ min: -180, max: 180 })
    .withMessage("Maximum latitude is invalid"),
  check("minLng")
    .optional({ checkFalsy: true })
    .isDecimal({ min: -90, max: 90 })
    .withMessage("Minimum longitude is invalid"),
  check("maxLng")
    .optional({ checkFalsy: true })
    .isDecimal({ min: -180, max: 180 })
    .withMessage("Maximum longitude is invalid"),
  check("minPrice")
    .optional({ checkFalsy: true })
    .isDecimal({ min: 0 })
    .withMessage("Minimum price must be greater than or equal to 0"),
  check("maxPrice")
    .optional({ checkFalsy: true })
    .isDecimal({ min: 0 })
    .withMessage("Maximum price must be greater than or equal to 0"),
  handleValidationErrors,
];

// get all spots
router.get("/", validateQueryParams, async (req, res) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
    req.query;

  // convert page and size to integers from strings
  page = parseInt(page, 10) || 1;
  size = parseInt(size, 10) || 20;

  const pagination = {
    limit: size,
    offset: (page - 1) * size,
  };

  // convert any other filter conditions
  const filterConditions = {};

  if (minLat || maxLat) {
    filterConditions.lat = {};
    if (minLat) filterConditions.lat[Op.gte] = parseFloat(minLat);
    if (maxLat) filterConditions.lat[Op.lte] = parseFloat(maxLat);
  }

  if (minLng || maxLng) {
    filterConditions.lng = {};
    if (minLng) filterConditions.lng[Op.gte] = parseFloat(minLng);
    if (maxLng) filterConditions.lng[Op.lte] = parseFloat(maxLng);
  }

  if (minPrice || maxPrice) {
    filterConditions.price = {};
    if (minPrice) filterConditions.price[Op.gte] = parseFloat(minPrice);
    if (maxPrice) filterConditions.price[Op.lte] = parseFloat(maxPrice);
  }

  try {
    const spots = await Spot.findAll({
      where: filterConditions,
      ...pagination,
    });

    const totalSpots = await Spot.count({
      where: filterConditions,
    });

    const response = {
      Spots: spots,
      page: parseInt(page, 10),
      size: parseInt(size, 10),
      total: totalSpots,
    };

    return res.json(response);
  } catch (e) {
    next(e);
  }
});

// get all spots by owner id
// correction: get all spots of the *CURRENT USER*
// route should be /api/spots/current
router.get("/current", requireAuth, async (req, res, next) => {
  // const ownerId = Number(req.params.ownerId);
  const ownerId = req.user.id; // comes from the middleware to add user to req
  try {
    const allSpots = await Spot.findAll({
      where: { ownerId },
    });

    res.json({ spots: allSpots });
  } catch (e) {
    next(e);
  }
});

// get a single spot
router.get("/:spotId", async (req, res, next) => {
  const spotId = Number(req.params.spotId);

  try {
    const spot = await Spot.findByPk(spotId, {
      include: [
        {
          model: User,
          attributes: userAttributes, // only has id, firstName, lastName
          as: "Owner",
        },
        {
          model: SpotImage,
          attributes: imageAttributes,
          as: "SpotImages",
        },
      ],
    });
    if (!spot) {
      //spot not found
      const err = new Error("Spot couldn't be found");
      err.status = 404;
      return next(err);
    }

    res.json(spot);
  } catch (e) {
    next(e);
  }
});

// create a spot
router.post("/", requireAuth, validateSpot, async (req, res) => {
  const ownerId = req.user.id;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  try {
    const spot = await Spot.create({
      ownerId,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });
    if (!spot) {
      const err = new Error("Spot couldn't be created");
      err.status = 404;
      return next(err);
    }
    res.status(201).json({ spot });
  } catch (e) {
    next(e);
  }
});

// Add image to spot based on spot id
router.post("/:spotId/images", requireAuth, async (req, res) => {
  const ownerId = req.user.id;
  const { url, preview } = req.body;
  const spotId = Number(req.params.spotId);
  try {
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      const err = new Error("Spot couldn't be found");
      err.status = 404;
      next(err);
    }
    if (spot.ownerId !== ownerId) {
      const err = new Error("Forbidden");
      err.status = 403;
      next(err);
    }
    const newImage = await SpotImage.create({
      spotId,
      url,
      preview,
    });
    res.status(201).json(newImage);
  } catch (e) {
    next(e);
  }
});

// edit a spot by spot id
router.put("/:spotId", requireAuth, validateSpot, async (req, res) => {
  const ownerId = req.user.id;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

  const spotId = Number(req.params.spotId);

  try {
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      const err = new Error("Spot couldn't be found");
      err.status = 404;
      next(err);
    }

    if (spot.ownerId !== ownerId) {
      const err = new Error("Forbidden");
      err.status = 403;
      next(err);
    }

    await spot.update({
      ownerId,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });
    await spot.save();
    res.status(200).json({ spot });
  } catch (e) {
    next(e);
  }
});

// delete spot by spot id
router.delete("/:spotId", requireAuth, async (req, res) => {
  const spotId = Number(req.params.spotId);

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      const err = new Error("Spot couldn't be found");
      err.status = 404;
      return next(err);
    }
    if (spot.ownerId !== req.user.id) {
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }
    spot.destroy();
    res.json({ message: "Successfully deleted" });
  } catch (e) {
    next(e);
  }
});

// get all bookings for a spot based on spot id
router.get("/:spotId/bookings", async (req, res, next) => {
  const spotId = Number(req.params.spotId);
  const uid = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      const err = new Error("Spot couldn't be found");
      err.status = 404;
      return next(err);
    }
    // is the user the owner of the spot?
    const isOwner = spot.ownerId === uid;

    let bookings;

    // if the user is the owner of the spot, include all details
    if (isOwner) {
      bookings = await Booking.findAll({
        where: { spotId },
        include: [
          {
            model: User,
            attributes: userAttributes, // only has id, firstName, lastName
            as: "User",
          },
        ],
      });

      return res.json({ Bookings: bookings });
    }

    // if the user is not the owner of the spot, only include basic details
    bookings = await Booking.findAll({
      where: { spotId },
      attributes: ["spotId", "startDate", "endDate"],
    });
    return res.json({ Bookings: bookings });
  } catch (error) {
    next(error);
  }
});

// create a booking from a spot based on spot id
router.post(
  "/:spotId/bookings",
  requireAuth,
  validateBooking,
  async (req, res) => {
    const ownerId = req.user.id;
    const { startDate, endDate } = req.body;
    const spotId = Number(req.params.spotId);
    try {
      // check if the spot exists
      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        const err = new Error("Spot Image couldn't be found");
        err.status = 404;
        next(err);
      }

      // check if the user is the owner of the spot
      if (spot.ownerId === ownerId) {
        const err = new Error("Spot must not belong to user");
        err.status = 403;
        next(err);
      }

      // booking conflicts with any existing booking
      const bookingConflicts = await Booking.findAll({
        where: {
          spotId,
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [startDate, endDate],
              },
            },
            {
              endDate: {
                [Op.between]: [startDate, endDate],
              },
            },
          ],
        },
      });

      if (bookingConflicts.length > 0) {
        const err = new Error(
          "Sorry, this spot is already booked for the specified dates"
        );
        err.status = 403;
        return next(err);
      }

      const booking = await Booking.create({
        spotId,
        userId: ownerId,
        startDate,
        endDate,
      });
      res.status(201).json(booking);
    } catch (e) {
      next(e);
    }
  }
);

// delete a spot image
router.delete("/:spotId/images/:imageId", requireAuth, async (req, res) => {
  const { spotId, imageId } = req.params;
  const uid = req.user.id;

  try {
    // check if the spot exists
    const spot = await Spot.findByPk(spotId, {
      include: [
        {
          model: SpotImage,
          where: { id: imageId },
          required: true,
        },
      ],
    });
    if (!spot) {
      const err = new Error("Spot couldn't be found");
      err.status = 404;
      next(err);
    }

    // check if the user is the owner of the spot
    if (spot.ownerId !== uid) {
      const err = new Error("Forbidden");
      err.status = 403;
      next(err);
    }

    // delete the image
    const image = await SpotImage.findByPk(imageId);
    if (!image) {
      const err = new Error("Spot Image couldn't be found");
      err.status = 404;
      return next(err);
    }

    await image.destroy();
    res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
