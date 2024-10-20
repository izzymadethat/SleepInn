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
    closeMenu();
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <>
      <div className="profile-button-container" data-testid="user-menu-button">
        <button className="profile-button" onClick={toggleMenu}>
          <div>
            <MdOutlineMenu />
          </div>
          <div>{showMenu ? <RiUserReceivedFill /> : <RiUserShared2Fill />}</div>
        </button>
      </div>
      <ul className={ulClassName} ref={ulRef} data-testid="user-dropdown-menu">
        {user ? (
          <>
            <h3>My Sleep Profile</h3>
            <hr />

            <li>
              Hello,{" "}
              <span style={{ fontWeight: "bold", color: "#ff6f61" }}>
                {user.firstName}
              </span>
            </li>

            <li style={{ fontStyle: "italic" }}>{user.email}</li>

            <li
              style={{
                textAlign: "center",
                borderTop: "1px solid black",
                borderBottom: "1px solid black",
                padding: ".5rem 0",
                width: "95%"
              }}
            >
              <Link to="/spots/current" data-testid="manage-spots-link">
                Manage Spots
              </Link>
            </li>

            <li style={{ marginTop: "-1rem" }}>
              <button onClick={logout} className="site-btn primary">
                Log Out <RiLogoutBoxRLine />
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="profile-dropdown__link">
              <OpenModalButton
                buttonText="Log in"
                onButtonClick={closeMenu}
                modalComponent={<LoginFormModal />}
              />
            </li>
            <li className="profile-dropdown__link">
              <OpenModalButton
                buttonText="Sign up"
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
