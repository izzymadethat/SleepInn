const { requireAuth } = require("../../utils/auth");
const { Review, Image } = require("../../db/models");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const {
  reviewImageAttributes,
  spotAttributes,
  userAttributes,
} = require("../../utils/attributes");
const router = require("express").Router();

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

/*
========================================
  Get all the reviews of the current user
========================================
*/
router.get("/:userId", requireAuth, async (req, res, next) => {
  const uid = req.params.id;

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
          model: Image,
          as: "ReviewImages",
          attributes: reviewImageAttributes,
        },
      ],
    });

    if (!reviews) {
      const err = new Error("User couldn't be found");
      err.status = 404;
      return next(err);
    }

    res.json({ Reviews: reviews });
  } catch (error) {
    error.status = 500;
    next(error);
  }
});

/*
==========================================
    Get all reviews based on the spot's id
==========================================
*/

router.get("/:spotId", async (req, res, next) => {
  const spotId = req.params.spotId;

  try {
    const reviews = await Review.findAll({
      where: {
        spotId,
      },
      include: [
        {
          model: User,
          attributes: userAttributes,
        },
        {
          model: Image,
          as: "ReviewImages",
          attributes: reviewImageAttributes,
        },
      ],
    });

    if (!reviews) {
      const err = new Error("Spot couldn't be found");
      err.status = 404;
      return next(err);
    }

    res.json({ Reviews: reviews });
  } catch (error) {
    next(error);
  }
});

/*
==========================================
    Create a review for a spot based on the spot's id
==========================================
*/
router.post("/:spotId", requireAuth, validateReview, async (req, res, next) => {
  const spotId = req.params.spotId;
  const { review, stars } = req.body;

  const reviewObj = {
    userId: req.user.id,
    spotId,
    review,
    stars,
  };

  try {
    const existingSpot = await Spot.findByPk(spotId);
    const existingReview = await Review.findOne({
      where: {
        userId: req.user.id,
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
    return res.json({ newReview });
  } catch (error) {
    next(error);
  }
});

/*
==========================================
    Add an image to a review based on the review's id
==========================================
*/
router.post("/:reviewId/images", requireAuth, async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const { url } = req.body;

  try {
    // check if review exists
    const existingReview = await Review.findByPk(reviewId, {
      include: [reviewImageAttributes],
    });

    // send 404 if review doesn't exist
    if (!existingReview) {
      const err = new Error("Review couldn't be found");
      err.status = 404;
      return next(err);
    }

    //   check if review belongs to user
    if (existingReview.userId !== req.user.id) {
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }

    // check if maxed images - max of 10
    if (existingReview.Images.length >= 10) {
      const err = new Error(
        "Maximum number of images for this resource was reached"
      );
      err.status = 403;
      return next(err);
    }

    const newImage = await existingReview.createImage({
      url,
    });

    return res.status(201).json({
      id: newImage.id,
      url: newImage.url,
    });
  } catch (error) {
    res.status(500);
    return next(error);
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
      if (existingReview.userId !== req.user.id) {
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
      res.status(500);
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
  try {
    const existingReview = await Review.findByPk(reviewId);
    // check if review exists
    if (!existingReview) {
      const err = new Error("Review couldn't be found");
      err.status = 404;
      return next(err);
    }

    // check if review belongs to user
    if (existingReview.userId !== req.user.id) {
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }

    await existingReview.destroy();

    return res.json({ message: "Successfully deleted" });
  } catch (error) {
    res.status(500);
    return next(error);
  }
});

/*
==========================================
    Delete a review image
==========================================
*/
router.delete(
  "/:reviewId/images/:imageId",
  requireAuth,
  async (req, res, next) => {
    const { reviewId, imageId } = req.params;

    try {
      const existingReview = await Review.findByPk(reviewId, {
        include: [{ model: Image, where: { id: imageId } }],
      });

      // check if review exists
      if (!existingReview) {
        const err = new Error("Review couldn't be found");
        err.status = 404;
        return next(err);
      }

      // check if review belongs to user
      if (existingReview.userId !== req.user.id) {
        const err = new Error("Forbidden");
        err.status = 403;
        return next(err);
      }

      // check if image belongs to review
      if (existingReview.Images[0].id !== imageId) {
        const err = new Error("Review Image couldn't be found");
        err.status = 404;
        return next(err);
      }

      await existingReview.removeImage(imageId);
      return res.json({ message: "Successfully deleted" });
    } catch (error) {
      res.status(500);
      return next(error);
    }
  }
);

module.exports = router;
