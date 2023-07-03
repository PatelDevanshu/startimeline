import { Fragment } from "react";
import "./App.scss"
import Sidebar from "./components/Sidebar/Sidebar";
import Map from "./components/Map/Map";
import { MapProvider } from "./Context";

function App() {



  return (
    <Fragment>
      <MapProvider>

        <div className="main-container">
          <Sidebar />
          <Map />

        </div>
      </MapProvider>

    </Fragment>
  );
}

export default App;
