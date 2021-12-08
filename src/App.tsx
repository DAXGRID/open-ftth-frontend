import "mapbox-gl/dist/mapbox-gl.css";
import "react-toastify/dist/ReactToastify.css";
import { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter as Router } from "react-router-dom";
import { Slide, ToastContainer } from "react-toastify";
import BridgeConnector from "./bridge/BridgeConnector";
import Loading from "./components/Loading";
import SideMenu, { SideMenuItem } from "./components/SideMenu";
import TopMenu from "./groups/TopMenu";
import Routes from "./routes/Routes";
import { UserContext } from "./contexts/UserContext";
import { OverlayContext } from "./contexts/OverlayContext";
import { useKeycloak } from "@react-keycloak/web";
import Overlay from "./components/Overlay";

function App() {
  const { userName } = useContext(UserContext);
  const { overlayChild } = useContext(OverlayContext);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { initialized, keycloak } = useKeycloak();

  const toggleSideMenu = () => {
    setSideMenuOpen(!sideMenuOpen);
    // Hack to allow rezing of some components
    window.dispatchEvent(new Event("resize"));
  };

  if (!initialized) return <Loading />;
  // if keycloak is setup and user is authenticated but no username
  if (initialized && keycloak.authenticated && !userName) return <Loading />;

  return (
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

      {overlayChild && <Overlay>{overlayChild}</Overlay>}

      <header>
        <TopMenu toggleSideMenu={toggleSideMenu} />
      </header>
      <SideMenu open={sideMenuOpen}>
        <SideMenuItem path="/" linkText={t("Home")} />
        <SideMenuItem
          path="/place-span-equipment"
          linkText={t("Place span equipments")}
        />
        <SideMenuItem
          path="/schematic-diagram"
          linkText={t("Schematic diagram")}
        />
        <SideMenuItem path="/work-tasks" linkText={t("Work tasks")} />
      </SideMenu>
      <main
        className={`main-container ${sideMenuOpen ? "side-menu-open" : ""}`}
      >
        <Routes />
      </main>
    </Router>
  );
}

export default App;
