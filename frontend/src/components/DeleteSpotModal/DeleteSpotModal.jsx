import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./DeleteSpotModal.css";
import * as spotActions from "../../store/spots";

const DeleteSpotModal = ({ spot }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleDeleteSpot = () => {
    dispatch(spotActions.deleteSpot(spot.id))
      .then(() => {
        dispatch(spotActions.fetchSpots());
        closeModal();
        alert("Spot Deleted");
      })
      .catch(() => {
        alert("Spot could not be deleted. Please try again later.");
      });
  };

  return (
    <>
      <h1>Are You Sure You Want to Delete this Spot?</h1>
      <p>This action cannot be undone.</p>
      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}
      >
        <button
          onClick={handleDeleteSpot}
          className="site-btn primary"
          style={{ backgroundColor: "red" }}
        >
          Yes (Delete Spot)
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
          No (Keep Spot)
        </button>
      </div>
    </>
  );
};

export default DeleteSpotModal;
