import { useEffect } from "react";
import { FaStar } from "react-icons/fa6";

const Home = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
      }}
    >
      <div className="card">
        <div>
          <img src="https://placehold.co/400x400/png" alt="img" />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Tallahassee, FL</h3>
          <FaStar />
        </div>
        <p>$123 per night</p>
      </div>

      <div className="card">
        <img src="https://placehold.co/400x400/png" alt="img" />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Tallahassee, FL</h3>
          <FaStar />
        </div>
        <p>$123 per night</p>
      </div>

      <div className="card">
        <img src="https://placehold.co/400x400/png" alt="img" />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Tallahassee, FL</h3>
          <FaStar />
        </div>
        <p>$123 per night</p>
      </div>
    </div>
  );
};

export default Home;
