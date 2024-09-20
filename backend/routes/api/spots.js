const router = require("express").Router();
const {
  Spot,
  User,
  Booking,
  SpotImage,
  Review,
  ReviewImage,
  sequelize,
} = require("../../db/models");
const bookingsRouter = require("./booking");
const reviewsRouter = require("./reviews");

const { requireAuth } = require("../../utils/auth");
const { Op, fn, col, Sequelize } = require("sequelize");
const { check, query, body } = require("express-validator");
query;
const { handleValidationErrors } = require("../../utils/validation");
const {
  userAttributes,
  imageAttributes,
  spotAttributes,
} = require("../../utils/attributes");

const validateSpot = [
  body("address")
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"),
  body("city").exists({ checkFalsy: true }).withMessage("City is required"),
  body("state").exists({ checkFalsy: true }).withMessage("State is required"), // 400
  body("country")
    .exists({ checkFalsy: true })
    .withMessage("Country is required"), // 400
  body("lat")
    .exists({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be within -90 and 90")
    .toFloat(),
  body("lng")
    .exists({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be within -180 and 180")
    .toFloat(),
  body("name")
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),
  body("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  body("price")
    .exists({ checkFalsy: true })
    .isFloat({ gt: 0 })
    .withMessage("Price per day must be a positive number")
    .toInt(10),
  handleValidationErrors,
];

const validateQueryParams = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be greater than or equal to 1")
    .toInt(10),
  query("size")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Size must be between 1 and 20")
    .toInt(10),
  query("minLat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Minimum latitude is invalid")
    .toFloat(),
  query("maxLat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Maximum latitude is invalid")
    .toFloat(),
  query("minLng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Minimum longitude is invalid")
    .toFloat(),
  query("maxLng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Maximum longitude is invalid")
    .toFloat(),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be greater than or equal to 0")
    .toFloat(),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be greater than or equal to 0")
    // check if max less than minPrice
    .custom((value, { req }) => {
      const minPrice = parseFloat(req.query.minPrice);
      const maxPrice = parseFloat(value);
      if (!isNaN(minPrice) && maxPrice < minPrice) {
        throw new Error(
          "Maximum price must be greater than or equal to minimum price"
        );
      }
      return true;
    })
    .toFloat(),
  handleValidationErrors,
];

const validateSpotImage = [
  body("url").exists({ checkFalsy: true }).withMessage("Url is required"),
  body("preview")
    .exists({ checkFalsy: true })
    .isBoolean()
    .withMessage("Preview is required"),
];

router.use("/:spotId/bookings", bookingsRouter);
router.use("/:spotId/reviews", reviewsRouter);

// Get all Spots
router.get("/", validateQueryParams, async (req, res, next) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
    req.query;

  const limit = size ?? 20;
  const offset = page ? (page - 1) * size : 0;
  const where = {};

  if (minLat !== undefined && maxLat !== undefined) {
    where.lat = {
      [Op.between]: [minLat, maxLat],
    };
  } else if (minLat !== undefined) {
    where.lat = {
      [Op.gte]: minLat,
    };
  } else if (maxLat !== undefined) {
    where.lat = {
      [Op.lte]: maxLat,
    };
  }

  if (minLng !== undefined && maxLng !== undefined) {
    where.lng = {
      [Op.between]: [minLng, maxLng],
    };
  } else if (minLng !== undefined) {
    where.lng = {
      [Op.gte]: minLng,
    };
  } else if (maxLng !== undefined) {
    where.lng = {
      [Op.lte]: maxLng,
    };
  }

  if (minPrice !== undefined && maxPrice !== undefined) {
    where.price = {
      [Op.between]: [minPrice, maxPrice],
    };
  } else if (minPrice !== undefined) {
    where.price = {
      [Op.gte]: minPrice,
    };
  } else if (maxPrice !== undefined) {
    where.price = {
      [Op.lte]: maxPrice,
    };
  }

  try {
    const spots = await Spot.findAll({
      where,
      limit,
      offset,
      attributes: [
        ...spotAttributes,
        "createdAt",
        "updatedAt",
        [
          sequelize.literal(
            '(SELECT AVG("stars") FROM "Reviews" WHERE "Reviews"."spotId" = "Spot"."id")'
          ),
          "avgRating",
        ],
        [
          sequelize.literal(
            `(SELECT "url" FROM "SpotImages" WHERE "SpotImages"."spotId" = "Spot"."id" AND "SpotImages"."preview" = true LIMIT 1)`
          ),
          "previewImage",
        ],
        // for some reason, had to add like this
      ],

      include: [
        {
          model: Review,
          attributes: [],
        },
        {
          model: SpotImage,
          attributes: [],
        },
      ],
      group: ["Spot.id"],
    });

    res.json({ Spots: spots, page, size });
  } catch (error) {
    next(error);
  }
});

// Get all Spots owned by the Current User
router.get("/current", requireAuth, async (req, res, next) => {
  const ownerId = req.user.id; // comes from the middleware to add user to req

  try {
    const spots = await Spot.findAll({
      where: { ownerId },
      attributes: {
        include: [
          // Calculate average rating
          [Sequelize.fn("AVG", col("Reviews.stars")), "avgRating"],
          [
            sequelize.literal(
              `(SELECT "url" FROM "SpotImages" WHERE "SpotImages"."spotId" = "Spot"."id" AND "SpotImages"."preview" = true LIMIT 1)`
            ),
            "previewImage",
          ],
        ],
      },
      include: [
        {
          model: Review,
          attributes: [], // We don't need to include Review attributes in the result
        },
        {
          model: SpotImage,
          attributes: [], // We don't need to include SpotImage attributes in the result
        },
      ],
      group: ["Spot.id"], // Group by spot ID to get aggregate values per spot
    });

    res.json({ Spots: spots });
  } catch (error) {
    next(error);
  }
});

// Get details of a Spot from an id
router.get("/:spotId", async (req, res, next) => {
  const spotId = req.params.spotId;
  try {
    const spot = await Spot.findByPk(spotId, {
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT AVG("stars") FROM "Reviews" WHERE "Reviews"."spotId" = "Spot"."id")`
            ),
            "avgStarRating",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT("id") FROM "Reviews" WHERE "Reviews"."spotId" = "Spot"."id")`
            ),
            "numReviews",
          ],
        ],
      },
      include: [
        {
          model: User,
          as: "Owner",
          attributes: userAttributes,
        },
        {
          model: SpotImage,
          attributes: [...imageAttributes, "preview"],
        },
      ],
      group: ["Spot.id"],
    });

    if (!spot)
      return res.status(404).json({ message: "Spot couldn't be found" });

    res.json(spot);
  } catch (error) {
    next(error);
  }
});

// Create a Spot
router.post("/", requireAuth, validateSpot, async (req, res, next) => {
  const ownerId = req.user.id;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  try {
    const newSpot = await Spot.create({
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

    res.status(201).json(newSpot);
  } catch (error) {
    next(error);
  }
});

// Add an Image to a Spot based on the Spot's id
router.post("/:spotId/images", requireAuth, async (req, res, next) => {
  const spotId = req.params.spotId;
  const userId = req.user.id;
  const { url, preview } = req.body;
  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== userId) {
      return res.status(403).json({
        message: "Forbidden: Spot does not belong to user",
      });
    }

    const image = await SpotImage.create({
      spotId,
      url,
      preview,
    });

    return res.json({ id: image.id, url: image.url, preview: image.preview });
  } catch (error) {
    next(error);
  }
});

// Edit a Spot
router.put("/:spotId", requireAuth, validateSpot, async (req, res, next) => {
  const spotId = req.params.spotId;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const ownerId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== ownerId) {
      return res.status(403).json({
        message: "Forbidden: Spot does not belong to user",
      });
    }

    await spot.update({
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

    res.json({
      id: spot.id,
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
  } catch (error) {
    next(error);
  }
});

// Delete a Spot
router.delete("/:spotId", requireAuth, async (req, res, next) => {
  const spotId = req.params.spotId;
  const ownerId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== ownerId) {
      return res.status(403).json({
        message: "Forbidden: Spot does not belong to user",
      });
    }

    spot.destroy();

    res.status(200).json({
      message: "Successfully deleted",
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
//  Get all reviews based on the spot's id
// ==========================================

router.get("/:spotId/reviews", async (req, res, next) => {
  const spotId = req.params.spotId;

  try {
    const spot = await Spot.findOne({
      where: { id: spotId },
      include: [
        {
          model: Review,
          attributes: [
            "id",
            "userId",
            "spotId",
            "review",
            "stars",
            "createdAt",
            "updatedAt",
          ],
          include: [
            {
              model: User,
              attributes: userAttributes,
            },
            {
              model: ReviewImage,
              attributes: imageAttributes,
            },
          ],
        },
      ],
    });

    // If spot is not found, return a 404 error
    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    }

    const reviews = spot.Reviews.map((review) => {
      return {
        id: review.id,
        userId: review.userId,
        spotId: review.spotId,
        review: review.review,
        stars: review.stars,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        User: {
          id: review.User.id,
          firstName: review.User.firstName,
          lastName: review.User.lastName,
        },
        ReviewImages: review.ReviewImages.map((image) => ({
          id: image.id,
          url: image.url,
        })),
      };
    });

    res.json({ Reviews: reviews });
  } catch (error) {
    next(error);
  }
});

// get all bookings for a spot based on spot id
router.get("/:spotId/bookings", requireAuth, async (req, res, next) => {
  const spotId = req.params.spotId;
  const uid = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
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
          },
        ],
      });
    } else {
      // if the user is not the owner of the spot, only include basic details
      bookings = await Booking.findAll({
        where: { spotId },
        attributes: ["spotId", "startDate", "endDate"],
      });
    }

    return res.json({ Bookings: bookings });
  } catch (error) {
    next(error);
  }
});

// ==========================================
//  Create a booking for a spot based on spot id
// ==========================================

router.post("/:spotId/bookings", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { startDate, endDate } = req.body;
  const userId = req.user.id;

  try {
    // Find the spot by spotId and check if it exists
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    }

    // Check if the spot belongs to the current user (authorization)
    if (spot.ownerId === userId) {
      return res.status(403).json({
        message: "Forbidden: You cannot book your own spot",
      });
    }

    // Check for booking conflicts
    const today = new Date();
    const todayDateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Strip the time component from the received dates
    const startDateOnly = new Date(
      startDateObj.getFullYear(),
      startDateObj.getMonth(),
      startDateObj.getDate()
    );
    const endDateOnly = new Date(
      endDateObj.getFullYear(),
      endDateObj.getMonth(),
      endDateObj.getDate()
    );

    // Validate the new startDate and endDate
    const errors = {};

    if (startDateOnly < todayDateOnly) {
      errors.startDate = "Start Date cannot be in the past";
    }
    if (endDateOnly <= startDateOnly) {
      errors.endDate = "End Date cannot be on or before startDate";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Bad Request",
        errors,
      });
    }

    // Check for booking conflicts
    const conflictingBookings = await Booking.findAll({
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
          {
            [Op.and]: [
              { startDate: { [Op.lte]: startDate } },
              { endDate: { [Op.gte]: endDate } },
            ],
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking",
        },
      });
    }

    // Create the booking
    const newBooking = await Booking.create({
      spotId,
      userId,
      startDate,
      endDate,
    });
    // Format the startDate and endDate to remove the time component
    const formattedBooking = {
      ...newBooking.toJSON(),
      startDate: new Date(newBooking.startDate).toISOString().slice(0, 10),
      endDate: new Date(newBooking.endDate).toISOString().slice(0, 10),
    };

    res.status(201).json(formattedBooking);
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;
