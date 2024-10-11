import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import * as sessionActions from "../../store/session";
import { useDispatch, useSelector } from "react-redux";
import "./LoginFormPage.css";

const LoginFormPage = () => {
  const sessionUser = useSelector((state) => state.session.user);
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  if (sessionUser) return <Navigate to="/" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    dispatch(sessionActions.loginUser({ credential, password })).catch(
      async (res) => {
        const data = await res.json();
        if (data?.errors) setErrors(data.errors);
      }
    );
  };

  return (
    <>
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <label className="login-form__input">
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.credential}
        <button type="submit">Log In</button>
      </form>
    </>
  );
};

export default LoginFormPage;
