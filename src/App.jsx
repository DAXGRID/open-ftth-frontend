import React, { useState } from "react";
import Routes from "./routes/Routes";
import TopMenu from "./components/TopMenu";
import BridgeConnector from "./bridge/BridgeConnector";
import BridgeRouter from "./bridge/BridgeRouter";
import SideMenu from "./components/SideMenu";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const toggleSideMenu = () => {
    setSideMenuOpen(!sideMenuOpen);
  };

  return (
    <Router>
      <BridgeConnector />
      <BridgeRouter />
      <header>
        <TopMenu toggleSideMenu={toggleSideMenu} />
      </header>
      <SideMenu open={sideMenuOpen} />
      <main
        className={
          sideMenuOpen ? "main-container side-menu-open" : "main-container"
        }
      >
        <Routes />
      </main>
    </Router>
  );
}

export default App;
