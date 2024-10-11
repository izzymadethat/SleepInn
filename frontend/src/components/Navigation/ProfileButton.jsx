import {
  RiLogoutBoxRLine,
  RiUserReceivedFill,
  RiUserShared2Fill
} from "react-icons/ri";
import { useDispatch } from "react-redux";
import * as sessionActions from "../../store/session";
import { useEffect, useRef, useState } from "react";
import OpenModalButton from "../OpenModalButton";
import SignupFormModal from "../SignupFormModal/SignupFormPage";
import LoginFormModal from "../LoginFormModal";

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
      <button onClick={toggleMenu} className="profile-button">
        {showMenu ? <RiUserReceivedFill /> : <RiUserShared2Fill />}
      </button>
      <ul className={ulClassName} ref={ulRef}>
        {user ? (
          <>
            <h3>My Sleep Profile</h3>
            <hr />

            <li>{user.username}</li>
            <li>
              {user.firstName} {user.lastName}
            </li>
            <li>{user.email}</li>
            <li>
              <button onClick={logout}>
                Log Out <RiLogoutBoxRLine />
              </button>
            </li>
          </>
        ) : (
          <>
            <h3 className="auth-header">Start getting sleep benefits!</h3>

            <div className="auth-buttons">
              <li>
                <OpenModalButton
                  buttonText="Log In"
                  onButtonClick={closeMenu}
                  modalComponent={<LoginFormModal />}
                />
              </li>
              <li>
                <OpenModalButton
                  buttonText="Sign Up"
                  onButtonClick={closeMenu}
                  modalComponent={<SignupFormModal />}
                />
              </li>
            </div>
          </>
        )}
      </ul>
    </>
  );
};

export default ProfileButton;
