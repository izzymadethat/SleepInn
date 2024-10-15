import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./SignupFormModal.css";
import { Navigate } from "react-router-dom";
import * as sessionActions from "../../store/session";
import { useModal } from "../../context/Modal";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const SignupFormModal = () => {
  const sessionUser = useSelector((state) => state.session.user);
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  if (sessionUser) return <Navigate to="/" replace />;

  const allInfoEntered =
    firstName && lastName && email && username && password && confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setErrors({});

    const user = {
      firstName,
      lastName,
      email,
      username,
      password
    };

    dispatch(sessionActions.registerUser(user))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data?.errors) setErrors(data.errors);
      });
  };

  return (
    <>
      <h1 className="signup-form__title">Sign Up To Sleep Inn!</h1>
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="signup-form__input-container">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <label
            htmlFor="firstName"
            className={`label ${firstName ? "active" : ""}`}
          >
            First Name
          </label>
        </div>
        {errors.firstName && <p className="error">{errors.firstName}</p>}

        <div className="signup-form__input-container">
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <label
            htmlFor="lastName"
            className={`label ${lastName ? "active" : ""}`}
          >
            Last Name
          </label>
        </div>
        {errors.lastName && <p className="error">{errors.lastName}</p>}

        <div className="signup-form__input-container">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="email" className={`label ${email ? "active" : ""}`}>
            Email
          </label>
        </div>
        {errors.email && <p className="error">{errors.email}</p>}
        <div className="signup-form__input-container">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label className={`label password-label ${username ? "active" : ""}`}>
            Username
          </label>
          {errors.username && <p className="error">{errors.username}</p>}
        </div>

        <div className="signup-form__input-container">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className={`label password-label ${password ? "active" : ""}`}>
            Password
          </label>
          <button
            type="button"
            className="show-password-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide Password" : "Show Password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
        <div className="signup-form__input-container">
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <label
            className={`label password-label ${
              confirmPassword ? "active" : ""
            }`}
          >
            Confirm Password
          </label>
        </div>

        {errors.confirmPassword && (
          <p className="error">{errors.confirmPassword}</p>
        )}
        <button
          style={{
            opacity: allInfoEntered ? 1 : 0.5,
            cursor: !allInfoEntered ? "not-allowed" : "pointer"
          }}
          type="submit"
          disabled={!allInfoEntered}
        >
          Sign Up
        </button>
      </form>
    </>
  );
};

export default SignupFormModal;
