import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";

const Navigation = ({ isLoaded }) => {
  const sessionUser = useSelector((state) => state.session.user);

  return (
    <nav className="nav-bar">
      <li>
        <NavLink to="/">SleepInn</NavLink>
      </li>
      {isLoaded && (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {sessionUser && (
            <li>
              <NavLink to="/spots/new">Create a new Spot</NavLink>
            </li>
          )}
          <li>
            <ProfileButton user={sessionUser} />
          </li>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
