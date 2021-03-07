import React, { useState, useLayoutEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Routes from "./routes/Routes";
import TopMenu from "./components/TopMenu";
import BridgeConnector from "./bridge/BridgeConnector";
import SideMenu, { SideMenuItem } from "./components/SideMenu";
import {
  faHome,
  faProjectDiagram,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import Loading from "./components/Loading";
import { MapProvider } from "./contexts/MapContext";
import { useKeycloak } from "@react-keycloak/web";
import { useTranslation } from "react-i18next";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const { initialized, keycloak } = useKeycloak();
  const { t } = useTranslation();

  // We use layout effect here to make sure that user is loaded before render
  useLayoutEffect(() => {
    if (!initialized) return;

    keycloak.loadUserProfile();
  }, [initialized, keycloak]);

  const toggleSideMenu = () => {
    setSideMenuOpen(!sideMenuOpen);
    // Hack to allow rezing of some components
    window.dispatchEvent(new Event("resize"));
  };

  if (!initialized) return <Loading />;

  return (
    <MapProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar
          closeOnClick={false}
          newestOnTop={false}
          rtl={false}
          pauseOnFocusLoss
          transition={Slide}
          pauseOnHover
        />
        <BridgeConnector />
        <header>
          <TopMenu toggleSideMenu={toggleSideMenu} />
        </header>
        <SideMenu open={sideMenuOpen}>
          <SideMenuItem path="/" linkText={t("Home")} icon={faHome} />
          <SideMenuItem
            path="/place-span-equipment"
            linkText={t("Place span equipments")}
            icon={faDownload}
          />
          <SideMenuItem
            path="/schematic-diagram"
            linkText={t("Schematic diagram")}
            icon={faProjectDiagram}
          />
        </SideMenu>
        <main
          className={
            sideMenuOpen ? "main-container side-menu-open" : "main-container"
          }
        >
          <Routes />
        </main>
      </Router>
    </MapProvider>
  );
}

export default App;
