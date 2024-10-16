import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import Home from "./components/pages/Home";
import SpotDetails from "./components/pages/SpotDetails";
import ManageSpots from "./components/pages/ManageSpots";
import DeleteSpotModal from "./components/DeleteSpotModal/DeleteSpotModal";
import SpotForm from "./components/SpotForm";
import * as spotActions from "./store/spots";

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      dispatch(spotActions.fetchSpots());
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
            children: [
              {
                index: true,
                element: <SpotDetails />
              },
              {
                path: "edit",
                element: <SpotForm />
              }
            ]
          },
          {
            path: "new",
            element: <SpotForm />
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
