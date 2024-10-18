import { useState } from "react";
import { useDispatch } from "react-redux";
import "./SignupFormModal.css";
import * as sessionActions from "../../store/session";
import { useModal } from "../../context/Modal";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const SignupFormModal = () => {
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

  const allInfoEntered =
    firstName && lastName && email && username && password && confirmPassword;
  const isInvalid =
    username.length < 4 || password.length < 6 || confirmPassword.length < 6;

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
        console.log(data);
        if (data?.errors) setErrors(data.errors);
      });
  };

  return (
    <div data-testid="sign-up-form">
      <h1 className="signup-form__title">Sign Up To Sleep Inn!</h1>
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="signup-form__input-container">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            name="firstName"
            data-testid="first-name-input"
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
            name="lastName"
            data-testid="last-name-input"
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
            label="Email"
            name="email"
            data-testid="email-input"
          />
          <label htmlFor="email" className={`label ${email ? "active" : ""}`}>
            Email
          </label>
          {errors.email && (
            <p className="error" data-testid="email-error-message">
              {errors.email}
            </p>
          )}
        </div>
        <div className="signup-form__input-container">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            name="username"
            data-testid="username-input"
          />

          <label className={`label password-label ${username ? "active" : ""}`}>
            Username
          </label>
          {errors.username && (
            <p className="error" data-testid="username-error-message">
              {errors.username}
            </p>
          )}
        </div>

        <div className="signup-form__input-container">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            name="password"
            data-testid="password-input"
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
            data-testid="confirm-password-input"
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
          disabled={!allInfoEntered || isInvalid}
          data-testid="form-sign-up-button"
        >
          Sign up
        </button>
      </form>
    </div>
  );
};

export default SignupFormModal;
