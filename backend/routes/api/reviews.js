const { requireAuth } = require("../../utils/auth");
const { Review, ReviewImage, Spot, User } = require("../../db/models");
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
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

const reviewImagesRouter = require("./review-images");
router.use("/:reviewId/images", reviewImagesRouter);

/*
========================================
  Get all the reviews of the current user
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
          attributes: spotAttributes,
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
// /api/reviews/:reviewId/images
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
        message: "Forbidden",
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
==========================================
*/
router.post("/", requireAuth, validateReview, async (req, res, next) => {
  const spotId = req.params.spotId;
  const uid = req.user.id;
  const { review, stars } = req.body;

  const reviewObj = {
    userId: uid,
    spotId,
    review,
    stars,
  };

  try {
    const existingSpot = await Spot.findByPk(spotId);
    const existingReview = await Review.findOne({
      where: {
        userId: uid,
        spotId,
      },
    });

    if (!existingSpot) {
      const err = new Error("Spot couldn't be found");
      err.status = 404;
      return next(err);
    }

    if (existingReview) {
      const err = new Error("User already has a review for this spot");
      err.status = 500;
      return next(err);
    }

    const newReview = await Review.create(reviewObj);
    return res.json( newReview );
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
    const uid = req.user.id;
    const { review, stars } = req.body;

    try {
      const existingReview = await Review.findByPk(reviewId);

      // check if review exists
      if (!existingReview) {
        const err = new Error("Review couldn't be found");
        err.status = 404;
        return next(err);
      }

      // check if review belongs to user
      if (existingReview.userId !== uid) {
        const err = new Error("Forbidden");
        err.status = 403;
        return next(err);
      }

      await existingReview.update({
        review: review ?? existingReview.review,
        stars: stars ?? existingReview.stars,
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
    const existingReview = await Review.findByPk(reviewId);
    // check if review exists
    if (!existingReview) {
      const err = new Error("Review couldn't be found");
      err.status = 404;
      return next(err);
    }

    // check if review belongs to user
    if (existingReview.userId !== uid) {
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }

    await existingReview.destroy();

    return res.json({ message: "Successfully deleted" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
