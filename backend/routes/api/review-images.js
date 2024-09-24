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
router.post("/:reviewId/images", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;
  const userId = req.user.id;

  try {
    // Find the review by reviewId and check if it belongs to the current user
    const review = await Review.findByPk(reviewId);

    // If the review doesn't exist
    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }
    // check if the current user is the owner of the review
    if (review.userId !== userId) {
      return res.status(403).json({
        message: "Forbidden: Review does not belong to current user",
      });
    }

    // Check if the review already has 10 images
    const imageCount = await ReviewImage.count({ where: { reviewId } });

    if (imageCount >= 10) {
      return res.status(403).json({
        message: "Maximum number of images for this resource was reached",
      });
    }

    // Create a new review image
    const newImage = await ReviewImage.create({
      reviewId: review.id,
      url,
    });

    // Return the newly created image
    const formattedImage = {
      id: newImage.id,
      url: newImage.url,
    };

    res.status(201).json(formattedImage);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to add image",
      error: err.message,
    });
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
        .json({
          message: "Forbidden: Review Image does not belong to current user",
        });
    }

    // Delete the image
    await image.destroy();
    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
