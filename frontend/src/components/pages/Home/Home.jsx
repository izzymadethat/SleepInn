import "./Home.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import * as spotActions from "../../../store/spots";
import SpotCard from "../../SpotCard";

const Home = () => {
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spots.allSpots);

  useEffect(() => {
    dispatch(spotActions.fetchSpots());
  }, [dispatch]);

  return (
    <main>
      <div className="home-container">
        <h1>Sleep only where you can dream.</h1>
        <div className="spots-grid">
          {spots.map((spot) => (
            <SpotCard spot={spot} key={spot.id} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Home;
