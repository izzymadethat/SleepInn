import { FaStar } from "react-icons/fa6";
import "./SpotDetails.css";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import * as spotActions from "../../../store/spots";
import * as reviewActions from "../../../store/reviews";
import OpenModalButton from "../../OpenModalButton";
import ReviewModal from "../../ReviewModal";
import { useModal } from "../../../context/Modal";

const DeleteReviewModal = ({ spotId, review }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleDeleteReview = () => {
    const isRemoved = dispatch(reviewActions.removeReview(spotId, review.id));
    if (isRemoved) {
      alert("Review Deleted");
      dispatch(reviewActions.fetchReviews(spotId));
      dispatch(spotActions.fetchSpotDetails(spotId));
      closeModal();
    } else {
      alert("Uh-oh. Something went wrong");
    }
  };

  return (
    <>
      <h1>Confirm Delete</h1>
      <p>Are you sure you want to delete this review?</p>
      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}
      >
        <button
          onClick={handleDeleteReview}
          className="site-btn primary"
          style={{ backgroundColor: "red" }}
        >
          Yes (Delete Review)
        </button>
        <button
          onClick={closeModal}
          className="site-btn secondary"
          style={{
            width: "100%",
            maxWidth: "100%",
            backgroundColor: "gray",
            color: "white",
            border: "none"
          }}
        >
          No (Keep Review)
        </button>
      </div>
    </>
  );
};

const SpotDetails = () => {
  const [loading, setLoading] = useState(true);
  const { spotId } = useParams();
  const { closeModal } = useModal();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.session.user);
  const spot = useSelector((state) => state.spots.spotDetails);
  const reviewsBySpot = useSelector((state) => state.reviews.reviewsBySpot);
  const reviews = reviewsBySpot[spotId] || [];
  const mainImage = spot?.SpotImages.filter((img) => img.preview)[0];
  const isSpotOwner = spot?.Owner?.id === currentUser?.id;

  const userHasReviewed = reviews.some(
    (review) => review.userId === currentUser?.id
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await dispatch(spotActions.fetchSpotDetails(spotId));
      await dispatch(reviewActions.fetchReviews(spotId));
      setLoading(false);
    };
    fetchData();
  }, [dispatch, spotId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="container">
      <div className="container__header">
        <h1>{spot.name}</h1>
        <h3>
          {spot.city}, {spot.state}, {spot.country}
        </h3>
      </div>
      <div className="images-grid__main">
        <div className="images-grid__img-container">
          <img src={mainImage.url} alt={`${spot.name} preview image`} />
        </div>

        <div className="images-grid__secondary">
          {spot.SpotImages.length > 1 ? (
            <>
              {spot.SpotImages.slice(1).map((img) => (
                <div className="images-grid__img-container" key={img.id}>
                  <img src={img.url} alt={`${spot.name} preview image`} />
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="images-grid__img-container">
                <img
                  src="https://placehold.co/600x400?text=No available image"
                  alt=""
                />
              </div>
              <div className="images-grid__img-container">
                <img
                  src="https://placehold.co/600x400?text=No available image"
                  alt=""
                />
              </div>
              <div className="images-grid__img-container">
                <img
                  src="https://placehold.co/600x400?text=No available image"
                  alt=""
                />
              </div>
              <div className="images-grid__img-container">
                <img
                  src="https://placehold.co/600x400?text=No available image"
                  alt=""
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="spot-details-grid">
        <div className="spot-details__content">
          <h2>
            Hosted by {spot.Owner.firstName} {spot.Owner.lastName}
          </h2>
          {spot.description && spot.description.length > 100 && (
            <div className="spot-details__description">
              <p>{spot.description}</p>
            </div>
          )}

          {spot.description && spot.description.length <= 100 && (
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Id
              reprehenderit distinctio reiciendis possimus, voluptatum quisquam
              iure soluta temporibus, itaque, voluptate provident rem facilis.
              Praesentium, porro!
            </p>
          )}
        </div>

        <div className="spot-details__booking-info">
          <div className="spot-details__price">
            <h3>${spot.price}/night</h3>
            <div>
              <FaStar />{" "}
              {reviews.length === 0 ? (
                <span>New</span>
              ) : (
                <span>
                  {spot.avgStarRating?.toFixed(1)}{" "}
                  <span style={{ position: "relative", bottom: ".375rem" }}>
                    .
                  </span>{" "}
                  {spot.numReviews} review
                  {spot.numReviews > 1 && "s"}
                </span>
              )}
            </div>
          </div>
          <button
            className="site-btn primary"
            onClick={() => alert("Heads Up! This Feature is coming soon.")}
          >
            Reserve
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="spot-details__review-section">
        {reviews.length === 0 ? (
          <>
            <h2>
              <FaStar /> New
            </h2>
            {currentUser && !isSpotOwner && !userHasReviewed && (
              <div>
                <OpenModalButton
                  buttonText={"Post Your Review"}
                  modalComponent={<ReviewModal spotId={spotId} />}
                  className="site-btn secondary"
                />
                <p>Be the first to review this spot!</p>
              </div>
            )}
          </>
        ) : (
          <h2>
            <FaStar /> {spot.avgStarRating.toFixed(1)}{" "}
            <span>
              <span style={{ position: "relative", bottom: ".375rem" }}>.</span>{" "}
              {spot.numReviews} review
              {spot.numReviews > 1 && "s"}
            </span>
          </h2>
        )}

        {reviews.length > 0 && (
          <>
            {currentUser && !isSpotOwner && !userHasReviewed && (
              <div>
                <OpenModalButton
                  buttonText={"Post Your Review"}
                  modalComponent={<ReviewModal spotId={spotId} />}
                  className="site-btn secondary"
                  style={{ margin: "0.625rem 0" }}
                />
              </div>
            )}
            {reviews.map((review) => (
              <div className="review-card" key={review.id}>
                <div>
                  <h3>{review.User.firstName}</h3>
                  <p>
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "2-digit",
                      year: "numeric"
                    })}
                  </p>
                </div>
                <p>{review.review}</p>
                {review.userId === currentUser?.id && (
                  <div className="review-actions">
                    <OpenModalButton
                      buttonText="Edit Review"
                      modalComponent={
                        <>
                          <h1>Feature Coming Soon!</h1>
                          <button
                            onClick={closeModal}
                            className="site-btn secondary"
                          >
                            Close
                          </button>
                        </>
                      }
                      className="site-btn secondary"
                    />
                    <OpenModalButton
                      buttonText={"Delete Review"}
                      modalComponent={
                        <DeleteReviewModal review={review} spotId={spotId} />
                      }
                      className="site-btn danger"
                    />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  );
};

export default SpotDetails;
