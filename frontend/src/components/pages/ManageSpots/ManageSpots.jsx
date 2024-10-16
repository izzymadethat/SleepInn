import { Link, useNavigate } from "react-router-dom";
import "./ManageSpots.css";
import { useDispatch, useSelector } from "react-redux";
import SpotCard from "../../SpotCard";
import OpenModalButton from "../../OpenModalButton";
import DeleteSpotModal from "../../DeleteSpotModal";
import { useEffect } from "react";
import * as spotActions from "../../../store/spots";

const ManageSpots = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const spots = useSelector((state) => state.spots.allSpots);

  useEffect(() => {
    dispatch(spotActions.fetchSpots());
  }, [dispatch]);

  if (!user) {
    return navigate("/", {
      state: { error: "You must be logged in to manage your spots" },
      replace: true
    });
  }

  const userSpots = spots.filter((spot) => spot.ownerId === user.id);

  if (userSpots.length === 0) {
    return (
      <main className="container">
        <div className="container__header">
          <h1>Manage Your Spots</h1>
        </div>
        <div className="empty-spots">
          <p>You haven&apos;t created any spots yet.</p>
          <Link to="/spots/new" className="site-btn secondary">
            Create a New Spot
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="container__header">
        <h1>Manage Your Spots</h1>
        <Link to="/spots/new" className="site-btn secondary">
          Create a New Spot
        </Link>
      </div>
      <div className="spots-grid">
        {userSpots.map((spot) => (
          <div key={spot.id}>
            <SpotCard key={spot.id} spot={spot} />
            <div className="spots-grid__actions">
              <Link
                to={`/spots/${spot.id}/edit`}
                className="site-btn secondary"
              >
                Update
              </Link>
              <OpenModalButton
                buttonText="Delete"
                modalComponent={<DeleteSpotModal spot={spot} />}
                className="site-btn danger"
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default ManageSpots;
