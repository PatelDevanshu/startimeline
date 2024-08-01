import { Fragment, useEffect } from "react";
import "./App.scss"
import Sidebar from "./components/Sidebar/Sidebar";
import Map from "./components/Map/Map";
import { MapProvider } from "./Context";
import Login from "../src/Auth/Login/Login.js";
import { Auth } from "./Auth/AuthContext/Authcontext.js";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./Auth/ProtectedRoute/ProtectedRoute.js";

function App() {
  useEffect(() => {
    fetch("https://startimeline.onrender.com/users/useriddata")
      .then((res) => res.json())
      .catch((err) => console.log(err));
  }, []);
  return (
    <Auth>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          <Route path='/' element={
            <ProtectedRoute>
              <Fragment>
                <MapProvider>
                  <div className="main-container">
                    <Sidebar />
                    <Map />
                  </div>
                </MapProvider>
              </Fragment>
            </ProtectedRoute>
          }
          />
        </Routes>
      </BrowserRouter>
    </Auth>
  );
}

export default App;
