const express = require("express");
const router = express.Router({ mergeParams: true });
const { requireAuth, requireProperAuthorization } = require("../../utils/auth");
const { Review, ReviewImage } = require("../../db/models");
const { imageAttributes } = require("../../utils/attributes");

/*
==========================================
    Add an image to a review based on the review's id
==========================================
*/
router.post("/", requireAuth, async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const uid = req.user.id;
  const { url } = req.body;

  try {
    // check if review exists
    const existingReview = await Review.findByPk(reviewId, {
      include: [
        {
          model: ReviewImage,
          attributes: imageAttributes,
        },
      ],
    });

    // send 404 if review doesn't exist
    if (!existingReview) {
      const err = new Error("Review couldn't be found");
      err.status = 404;
      return next(err);
    }

    //   check if review belongs to user
    if (existingReview.userId !== uid) {
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

    const newImage = await ReviewImage.create({
      url,
      reviewId,
    });

    return res.status(201).json({
      id: newImage.id,
      url: newImage.url,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
//  Delete a review image
// ==========================================
router.delete("/:imageId", requireAuth, async (req, res, next) => {
  const imageId = req.params.imageId;
  const userId = req.user.id;

  try {
    // Find the ReviewImage with its associated Review
    const image = await ReviewImage.findByPk(imageId, {
      include: {
        model: Review,
        attributes: ["userId"],
      },
    });

    // Return 404 if the image doesn't exist
    if (!image) {
      return res
        .status(404)
        .json({ message: "Review Image couldn't be found" });
    }

    // Check if the current user is the owner of the review
    if (image.Review.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this review" });
    }

    // Delete the image
    await image.destroy();
    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
