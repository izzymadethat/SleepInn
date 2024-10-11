import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import "./LoginFormModal.css";
import { useModal } from "../../context/Modal";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const LoginFormModal = () => {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    dispatch(sessionActions.loginUser({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data?.errors) {
          setErrors(data.errors);
          setPassword("");
        }
      });
  };

  return (
    <>
      <h1 className="login-form__title">Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-form__input-container">
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
            id="username-or-email"
          />
          <label
            htmlFor="username-or-email"
            className={`label ${credential ? "active" : ""}`}
          >
            Username or Email
          </label>
        </div>
        <div className="login-form__input-container">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            id="password"
          />
          <label
            htmlFor="password"
            className={`label password-label ${password ? "active" : ""}`}
          >
            Password
          </label>
          {errors.credential && (
            <p className="login-form__error">{errors.credential}</p>
          )}
          <button
            type="button"
            className="show-password-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide Password" : "Show Password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button
          style={{
            opacity: credential && password ? 1 : 0.5,
            cursor: !credential || !password ? "not-allowed" : "pointer"
          }}
          type="submit"
          disabled={!credential || !password}
        >
          Log In
        </button>
      </form>
    </>
  );
};

export default LoginFormModal;
