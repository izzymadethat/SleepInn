import { FaStar } from "react-icons/fa6";
import "./SpotDetails.css";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import * as spotActions from "../../../store/spots";

const SpotDetails = () => {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const spot = useSelector((state) => state.spots.spotDetails);
  const reviews = spot?.Reviews || [];
  const mainImage = spot?.SpotImages.filter((img) => img.preview)[0];

  useEffect(() => {
    dispatch(spotActions.fetchSpotDetails(spotId));
  }, [dispatch, spotId]);

  if (!spot) {
    return <div>Loading Spot...</div>;
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
                  {spot.avgStarRating} * {spot.numReviews} review
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
        {reviews.length == 0 ? (
          <h2>
            <FaStar /> New
          </h2>
        ) : (
          <h2>
            <FaStar /> {spot.avgStarRating}{" "}
            <span>
              * {spot.numReviews} review
              {spot.numReviews > 1 && "s"}
            </span>
          </h2>
        )}

        {reviews.length > 0 && (
          <>
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
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  );
};

export default SpotDetails;
