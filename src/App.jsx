import React from "react";
import Routes from "./routes/Routes";
import TopMenu from "./components/TopMenu";
import BridgeConnector from "./bridge/BridgeConnector";
import SideMenu from "./components/SideMenu";

function App() {
  return (
    <div>
      <BridgeConnector />
      <header>
        <TopMenu />
      </header>
      <SideMenu />
      <main className="main-container">
        <Routes />
      </main>
    </div>
  );
}

export default App;
