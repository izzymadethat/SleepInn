const { requireAuth } = require("../../utils/auth");
const { Review, Image } = require("../../db/models");
const { check } = require("express-validator");
const { where } = require("sequelize");
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
==========================================
    Edit a review
==========================================
*/
router.put("/:id", requireAuth, validateReview, async (req, res, next) => {
  const reviewId = req.params.id;
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

    const updatedReview = await existingReview.update({
      review: review ?? existingReview.review,
      stars: stars ?? existingReview.stars,
    });

    return res.json({ updatedReview });
  } catch (error) {
    res.status(500);
    return next(error);
  }
});

/* 
==========================================
    Add an image to a review based on the review's id
==========================================
*/
router.post("/:id/images", requireAuth, async (req, res, next) => {
  const reviewId = req.params.id;
  const { url } = req.body;

  try {
    // check if review exists
    const existingReview = await Review.findByPk(reviewId, {
      include: [{ model: Image }],
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
     Delete a review
==========================================
*/
router.delete("/:id", requireAuth, async (req, res, next) => {
  const reviewId = req.params.id;
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
