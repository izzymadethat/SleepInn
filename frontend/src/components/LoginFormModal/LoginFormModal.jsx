import { useState } from "react";
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

  const hasNoCredentials = !credential || !password;
  const isInvalid = credential.length < 4 || password.length < 6;

  const handleDemoUserLogin = () => {
    const demoUser = {
      credential: "demo@user.io",
      password: "password"
    };
    dispatch(sessionActions.loginUser(demoUser))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data?.errors) {
          setErrors(data.errors);
          setPassword("");
        }
      });
  };

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
    <div className="login-modal" data-testid="login-modal">
      <h1 className="login-form__title">Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-form__input-container">
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
            id="username-or-email"
            data-testid="credential-input"
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
            data-testid="password-input"
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

        <div className="login-form__demo-user">
          <button
            type="button"
            onClick={handleDemoUserLogin}
            data-testid="demo-user-button"
          >
            Log in as Demo User
          </button>
        </div>

        <button
          style={{
            opacity: credential && password ? 1 : 0.5,
            cursor: !credential || !password ? "not-allowed" : "pointer"
          }}
          type="submit"
          disabled={hasNoCredentials || isInvalid}
          data-testid="login-button"
        >
          Log in
        </button>
      </form>
    </div>
  );
};

export default LoginFormModal;
