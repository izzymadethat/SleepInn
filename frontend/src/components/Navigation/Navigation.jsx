import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import OpenModalButton from "../OpenModalButton";
import LoginFormModal from "../LoginFormModal";
import "./Navigation.css";
import SignupFormModal from "../SignupFormModal/SignupFormPage";

const Navigation = ({ isLoaded }) => {
  const sessionUser = useSelector((state) => state.session.user);

  let authLinks;
  if (sessionUser) {
    authLinks = (
      <li>
        <ProfileButton user={sessionUser} />
      </li>
    );
  } else {
    authLinks = (
      <>
        <li>
          <OpenModalButton
            buttonText="Log In"
            modalComponent={<LoginFormModal />}
          />
        </li>
        <li>
          <OpenModalButton
            buttonText="Sign Up"
            modalComponent={<SignupFormModal />}
          />
        </li>
      </>
    );
  }

  return (
    <nav className="nav-bar">
      <li>
        <NavLink to="/">Home</NavLink>
      </li>
      {isLoaded && authLinks}
    </nav>
  );
};

export default Navigation;
