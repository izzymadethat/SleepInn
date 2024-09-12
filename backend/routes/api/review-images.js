const express = require("express");
const router = express.Router({ mergeParams: true });
const { requireAuth, requireProperAuthorization } = require("../../utils/auth");
const { Review, ReviewImage } = require("../../db/models");

/*
==========================================
    Delete a review image
==========================================
*/
router.delete("/:imageId", requireAuth, async (req, res, next) => {
  const { reviewId, imageId } = req.params;
  const uid = req.user.id;

  try {
    const existingReview = await Review.findByPk(reviewId, {
      include: [{ model: ReviewImage, where: { id: imageId }, required: true }],
    });

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

    // check if image belongs to review
    if (existingReview.Images.length === 0) {
      const err = new Error("Review Image couldn't be found");
      err.status = 404;
      return next(err);
    }

    const image = await ReviewImage.findByPk(imageId);
    if (!image) {
      const err = new Error("Review Image couldn't be found");
      err.status = 404;
      return next(err);
    }

    await image.destroy();
    return res.json({ message: "Successfully deleted" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
