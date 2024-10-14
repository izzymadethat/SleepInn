import React from "react";
import ToolTip from "../ToolTip";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa6";

const SpotCard = ({ spot }) => {
  return (
    <ToolTip text={spot.name} key={spot.id}>
      <Link to={`/spots/${spot.id}`} className="spot-card">
        <div>
          <div className="spot-card__img-container">
            <img src={spot.previewImage} alt={spot.name} />
          </div>
          <div className="spot-card__header">
            <h3>
              {spot.city}, {spot.state}
            </h3>
            <div className="spot-card__rating">
              <FaStar />
              {spot.avgRating}
            </div>
          </div>
          <p className="spot-card__price">${spot.price} / night</p>
        </div>
      </Link>
    </ToolTip>
  );
};

export default SpotCard;
