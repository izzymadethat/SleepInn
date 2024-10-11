import {
  RiLogoutBoxRLine,
  RiUserReceivedFill,
  RiUserShared2Fill
} from "react-icons/ri";
import { useDispatch } from "react-redux";
import * as sessionActions from "../../store/session";
import { useEffect, useRef, useState } from "react";

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
        <h3>My Profile</h3>
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
      </ul>
    </>
  );
};

export default ProfileButton;
