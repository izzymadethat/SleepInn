import { useDispatch } from "react-redux";
import * as sessionActions from "../../store/session";
import { useEffect, useRef, useState } from "react";
import OpenModalButton from "../OpenModalButton";
import SignupFormModal from "../SignupFormModal";
import LoginFormModal from "../LoginFormModal";
import {
  RiUserReceivedFill,
  RiUserShared2Fill,
  RiLogoutBoxRLine
} from "react-icons/ri";
import { MdOutlineMenu } from "react-icons/md";
import { Link } from "react-router-dom";

const ProfileButton = ({ user }) => {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const toggleMenu = (e) => {
    e.stopPropagation(); // Keep click from bubbling up to document and triggering closeMenu
    setShowMenu(!showMenu);
  };

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logoutUser());
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <>
      <div className="profile-button-container">
        <button className="profile-button" onClick={toggleMenu}>
          <div>
            <MdOutlineMenu />
          </div>
          <div>{showMenu ? <RiUserReceivedFill /> : <RiUserShared2Fill />}</div>
        </button>
      </div>
      <ul className={ulClassName} ref={ulRef}>
        {user ? (
          <>
            <h3>My Sleep Profile</h3>
            <hr />

            <li>Hello, {user.username}</li>

            <li>{user.email}</li>
            <li>
              <Link to="/spots/current">Manage Spots</Link>
            </li>
            <li>
              <button onClick={logout} className="site-btn primary">
                Log Out <RiLogoutBoxRLine />
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="profile-dropdown__link">
              <OpenModalButton
                buttonText="Log In"
                onButtonClick={closeMenu}
                modalComponent={<LoginFormModal />}
              />
            </li>
            <li className="profile-dropdown__link">
              <OpenModalButton
                buttonText="Sign Up"
                onButtonClick={closeMenu}
                modalComponent={<SignupFormModal />}
              />
            </li>
          </>
        )}
      </ul>
    </>
  );
};

export default ProfileButton;
