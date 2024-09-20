const { requireAuth } = require("../../utils/auth");
const {
  Review,
  ReviewImage,
  Spot,
  User,
  Sequelize,
} = require("../../db/models");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const {
  spotAttributes,
  userAttributes,
  imageAttributes,
} = require("../../utils/attributes");
const router = require("express").Router({ mergeParams: true });

const validateReview = [
  check("review")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Review text is required"),
  check("stars")
    .exists({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5")
    .toInt(10),
  handleValidationErrors,
];

const reviewImagesRouter = require("./review-images");
router.use("/:reviewId/images", reviewImagesRouter);

/*
========================================
  Get all the reviews of the current user
  /api/reviews/current
========================================
*/
router.get("/current", requireAuth, async (req, res, next) => {
  const uid = req.user.id;

  try {
    const reviews = await Review.findAll({
      where: {
        userId: uid,
      },
      include: [
        {
          model: User,
          attributes: userAttributes,
        },
        {
          model: Spot,
          attributes: [
            ...spotAttributes,
            [
              Sequelize.literal(
                `(SELECT "url" FROM "SpotImages" WHERE "SpotImages"."spotId" = "Spot"."id" AND "SpotImages"."preview" = true LIMIT 1)`
              ),
              "previewImage",
            ],
          ],
        },
        {
          model: ReviewImage,
          as: "ReviewImages",
          attributes: imageAttributes,
        },
      ],
    });

    res.json({ Reviews: reviews });
  } catch (error) {
    next(error);
  }
});

// Add an image to a review based on the review's id
router.post("/:reviewId/images", requireAuth, async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const uid = req.user.id;
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      message: "Validation error",
      errors: {
        url: "Url is required",
      },
    });
  }

  try {
    // check if review exists
    const existingReview = await Review.findByPk(reviewId, {
      include: [
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });

    // review doesn't exist
    if (!existingReview) {
      return res.status(404).json({
        message: "Review couldn't be found",
      });
    }

    // review doesn't belong to user
    if (existingReview.userId !== uid) {
      return res.status(403).json({
        message: "Forbidden: Review does not belong to current user",
      });
    }

    const reviewImages = await ReviewImage.findAll({
      where: { reviewId },
    });

    // check if maxed images - max of 10
    if (reviewImages.length >= 10) {
      return res.status(403).json({
        message: "Maximum number of images for this resource was reached",
      });
    }

    // Now create the new image
    const newImage = await ReviewImage.create({
      url,
      reviewId,
    });

    res.status(201).json(newImage);
  } catch (error) {
    next(error);
  }
});

/*
==========================================
    Create a review for a spot based on the spot's id
    /api/spots/:spotId/reviews
==========================================
*/
router.post("/", requireAuth, validateReview, async (req, res, next) => {
  const spotId = req.params.spotId;
  const userId = req.user.id;
  const { review, stars } = req.body;

  try {
    const existingSpot = await Spot.findByPk(spotId);
    const existingReview = await Review.findOne({
      where: {
        userId,
        spotId,
      },
    });

    if (!existingSpot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    }

    if (existingReview) {
      return res.status(500).json({
        message: "User already has a review for this spot",
      });
    }

    const newReview = await Review.create({ userId, spotId, review, stars });
    return res.json(newReview);
  } catch (error) {
    next(error);
  }
});

/*
==========================================
    Edit a review
==========================================
*/
router.put(
  "/:reviewId",
  requireAuth,
  validateReview,
  async (req, res, next) => {
    const reviewId = req.params.reviewId;
    console.log(reviewId);
    const uid = req.user.id;
    const { review, stars } = req.body;

    try {
      const existingReview = await Review.findByPk(reviewId);

      // check if review exists
      if (!existingReview) {
        return res.status(404).json({
          message: "Review couldn't be found",
        });
      }

      // check if review belongs to user
      if (existingReview.userId !== uid) {
        return res.status(403).json({
          message: "Forbidden: Review does not belong to current user",
        });
      }

      await existingReview.update({
        review,
        stars,
      });

      await existingReview.save();

      return res.json({ review: existingReview });
    } catch (error) {
      return next(error);
    }
  }
);

/*
==========================================
     Delete a review
==========================================
*/
router.delete("/:reviewId", requireAuth, async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const uid = req.user.id;
  try {
    const review = await Review.findByPk(reviewId);
    // check if review exists
    if (!review) {
      return res.status(404).json({
        message: "Review couldn't be found",
      });
    }

    // check if review belongs to user
    if (review.userId !== uid) {
      const err = new Error(
        "Forbidden: Review does not belong to current user"
      );
      err.status = 403;
      return next(err);
    }

    await review.destroy();

    return res.json({ message: "Successfully deleted" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
