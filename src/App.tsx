import "mapbox-gl/dist/mapbox-gl.css";
import "react-toastify/dist/ReactToastify.css";
import { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter as Router } from "react-router-dom";
import { Slide, ToastContainer } from "react-toastify";
import BridgeConnector from "./bridge/BridgeConnector";
import Loading from "./components/Loading";
import SideMenu, { SideMenuItem } from "./components/SideMenu";
import MessageContainer from "./components/MessageContainer";
import ModalContainer from "./components/ModalContainer";
import TopMenu from "./groups/TopMenu";
import Routes from "./routes/Routes";
import { UserContext } from "./contexts/UserContext";
import { OverlayContext } from "./contexts/OverlayContext";
import { useKeycloak } from "@react-keycloak/web";
import Overlay from "./components/Overlay";
import Config from "./config";

// This is a hack made to handle tablet sizes.
// https://medium.com/quick-code/100vh-problem-with-ios-safari-92ab23c852a8
const appHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty("--app-height", `${window.innerHeight}px`);
};

window.addEventListener("resize", appHeight);
appHeight();
// end of hack...

function App() {
  const { userName, authenticated, hasRoles } = useContext(UserContext);
  const { overlayChild, showElement } = useContext(OverlayContext);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [showInitialDisplayedPrompt, setshowInitialDisplayedPrompt] =
    useState(true);
  const { t, i18n } = useTranslation();
  const { initialized } = useKeycloak();

  useEffect(() => {
    // Only show the message if everything has been initialized.
    if (!initialized) return;

    // Only show the message if the message has a value.
    if (!Config.INITIAL_USER_PROMPT) return;

    // It will displayed once on login, after it has been closed it won't be displayed again
    // until the user reloads the page.
    if (showInitialDisplayedPrompt) {
      showElement(
        <ModalContainer
          closeCallback={() => setshowInitialDisplayedPrompt(false)}
        >
          <MessageContainer
            message={Config.INITIAL_USER_PROMPT.message}
            linkText={Config.INITIAL_USER_PROMPT.linkText}
            linkUrl={Config.INITIAL_USER_PROMPT.linkUrl}
          />
        </ModalContainer>,
      );
    } else {
      showElement(null);
    }
  }, [initialized, showElement, showInitialDisplayedPrompt]);

  useEffect(() => {
    const language = localStorage.getItem("language");
    if (language) {
      if (i18n.language !== language) {
        i18n.changeLanguage(language);
      }
    } else {
      localStorage.setItem("language", Config.DEFAULT_USER_LANGUAGE);
    }
  }, [i18n, initialized]);

  const toggleSideMenu = () => {
    setSideMenuOpen(!sideMenuOpen);
    // Hack to allow rezing of some components
    window.dispatchEvent(new Event("resize"));
  };

  if (!initialized) return <Loading />;
  // if keycloak is setup and user is authenticated but no username.
  if (initialized && authenticated && !userName) return <Loading />;

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
        {hasRoles("reader") && <SideMenuItem path="/" linkText={t("Home")} />}
        {hasRoles("writer") && (
          <>
            <SideMenuItem
              path="/place-span-equipment"
              linkText={t("Place span equipments")}
            />
            <SideMenuItem
              path="/schematic-diagram"
              linkText={t("Schematic diagram")}
            />
            <SideMenuItem path="/work-tasks" linkText={t("Work tasks")} />
          </>
        )}
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
