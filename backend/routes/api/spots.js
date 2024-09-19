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
const { check, query, bodybody } = require("express-validator");
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
    .withMessage("Street address is required"), // 400
  body("city").exists({ checkFalsy: true }).withMessage("City is required"), // 400
  body("state").exists({ checkFalsy: true }).withMessage("State is required"), // 400
  body("country")
    .exists({ checkFalsy: true })
    .withMessage("Country is required"), // 400
  body("lat")
    .exists({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude is not valid"),
  body("lng")
    .exists({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude is not valid"),
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
    .withMessage("Price per day is required"),
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
    const spots = await Spot.findByPk(spotId, {
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
    res.json(spots);
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

// create a spot
router.post("/", requireAuth, async (req, res, next) => {
  const ownerId = req.user.id;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

  // Validation errors object
  let errors = {};

  // Required fields validation
  if (!address) errors.address = "Street address is required";
  if (!city) errors.city = "City is required";
  if (!state) errors.state = "State is required";
  if (!country) errors.country = "Country is required";

  // Latitude validation (must be between -90 and 90)
  if (lat === undefined || lat < -90 || lat > 90) {
    errors.lat = "Latitude must be within -90 and 90";
  }

  // Longitude validation (must be between -180 and 180)
  if (lng === undefined || lng < -180 || lng > 180) {
    errors.lng = "Longitude must be within -180 and 180";
  }

  // Name validation (must be less than 50 characters)
  if (!name || name.length > 50) {
    errors.name = "Name must be less than 50 characters";
  }

  // Description validation (must not be empty)
  if (!description) {
    errors.description = "Description is required";
  }

  // Price validation (must be a positive number)
  if (price === undefined || price <= 0) {
    errors.price = "Price per day must be a positive number";
  }

  // If there are validation errors, return a 400 response with the errors
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validation Error",
      errors,
    });
  }

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

    const formattedSpot = {
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
    };

    // Send the response with status 201 Created
    res.status(201).json(formattedSpot);
  } catch (e) {
    next(e);
  }
});

// Add image to spot based on spot id
router.post("/:spotId/images", requireAuth, async (req, res, next) => {
  const ownerId = req.user.id;
  const { url, preview } = req.body;
  const spotId = req.params.spotId;
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
    const formattedImage = {
      id: newImage.id,
      url: newImage.url,
      preview: newImage.preview,
    };
    res.status(201).json(formattedImage);
  } catch (e) {
    next(e);
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
      errors.startDate = "startDate cannot be in the past";
    }
    if (endDateOnly <= startDateOnly) {
      errors.endDate = "endDate cannot be on or before startDate";
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

// edit a spot by spot id
router.put("/:spotId", requireAuth, validateSpot, async (req, res, next) => {
  const spotId = req.params.spotId;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const ownerId = req.user.id;

  // 400 Status for body errors
  // Note: we'll use express-validator to validate the request body
  // This has been handled in "../../utils/validation.js"

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== ownerId) {
      return res.status(403).json({
        message: "Forbidden",
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
        message: "Forbidden",
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

module.exports = router;
