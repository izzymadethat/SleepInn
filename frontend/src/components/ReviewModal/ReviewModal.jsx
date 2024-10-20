import { useState } from "react";
import "./ReviewModal.css";
import { useModal } from "../../context/Modal";
import { FaStar } from "react-icons/fa6";
import * as reviewActions from "../../store/reviews";
import { useDispatch } from "react-redux";

const RatingStars = ({ rating, setRating }) => {
  return (
    <div className="rating-container">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <FaStar
            key={index}
            className={`star ${index < rating ? "filled" : ""}`}
            onClick={() => setRating(index + 1)}
            data-testid="review-star-clickable"
          />
        ))}
      <label htmlFor="rating">Stars</label>
    </div>
  );
};

const ReviewModal = ({ spotId }) => {
  const dispatch = useDispatch();
  const [reviewInput, setReviewInput] = useState("");
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState({});

  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const reviewData = {
      review: reviewInput,
      stars: rating
    };

    const response = await dispatch(
      reviewActions.addNewReview(spotId, reviewData)
    );

    if (response.errors) {
      setErrors(response.errors);
    } else {
      alert("Thank you for your review!");
      closeModal();
      await dispatch(reviewActions.fetchReviews(spotId));
    }
  };

  return (
    <div className="review-modal" data-testid="review-modal">
      <h2>How was your stay?</h2>
      {errors && errors.errors && (
        <p className="error">Something went wrong. Please try again.</p>
      )}
      <form onSubmit={handleSubmit} data-testid="review-form">
        <textarea
          cols={50}
          rows={10}
          placeholder="Leave your review here..."
          value={reviewInput}
          onChange={(e) => setReviewInput(e.target.value)}
        ></textarea>
        <RatingStars rating={rating} setRating={setRating} />
        <button
          type="submit"
          className="site-btn primary"
          disabled={reviewInput.length < 10 || rating < 1}
        >
          Submit Your Review
        </button>
      </form>
    </div>
  );
};

export default ReviewModal;
