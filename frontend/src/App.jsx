import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import Home from "./components/pages/Home";
import SpotDetails from "./components/pages/SpotDetails";
import CreateSpot from "./components/pages/CreateSpot";
import ManageSpots from "./components/pages/ManageSpots";
import DeleteSpotModal from "./components/DeleteSpotModal/DeleteSpotModal";

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
      <header>
        <Navigation isLoaded={isLoaded} />
      </header>
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/spots",
        children: [
          {
            path: ":spotId",
            element: <SpotDetails />
          },
          {
            path: "new",
            element: <CreateSpot />
          },
          {
            path: "current",
            element: <ManageSpots />
          },
          {
            path: "delete",
            element: <DeleteSpotModal />
          }
        ]
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
