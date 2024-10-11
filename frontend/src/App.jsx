import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import * as sessionActions from "./store/session";
import LoginFormModal from "./components/LoginFormModal";
import SignupFormPage from "./components/SignupFormPage";
import Navigation from "./components/Navigation";

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true);
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} /> {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <h1>
            Welcome to <span style={{ color: "#FF6F61" }}>SleepInn!</span>
          </h1>
        )
      },
      {
        path: "login",
        element: <LoginFormModal />
      },
      {
        path: "signup",
        element: <SignupFormPage />
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
