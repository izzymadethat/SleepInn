import ToolTip from "../ToolTip";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa6";

const SpotCard = ({ spot }) => {
  return (
    <div data-testid="spot-tile">
      <Link to={`/spots/${spot.id}`} data-testid="spot-link">
        <ToolTip text={spot.name}>
          <div className="spot-card">
            <div className="spot-card__img-container">
              <img
                src={spot.previewImage}
                alt={spot.name}
                data-testid="spot-thumbnail-image"
              />
            </div>
            <div className="spot-card__content">
              <div className="spot-card__header">
                <h3>
                  <span data-testid="spot-city">{spot.city}</span>, {spot.state}
                </h3>
                <div className="spot-card__rating" data-testid="spot-rating">
                  <FaStar />
                  {spot.avgRating ? spot.avgRating.toFixed(1) : "New"}
                </div>
              </div>
              <p className="spot-card__price" data-testid="spot-price">
                ${spot.price} <span>/ night</span>
              </p>
            </div>
          </div>
        </ToolTip>
      </Link>
    </div>
  );
};

export default SpotCard;
