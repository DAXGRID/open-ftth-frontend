import React from "react";
import Routes from "./routes/Routes";
import TopMenu from "./components/TopMenu";
import BridgeConnector from "./bridge/BridgeConnector";

function App() {
  return (
    <div>
      <BridgeConnector />
      <header>
        <TopMenu />
      </header>
      <main className="main-container">
        <Routes />
      </main>
    </div>
  );
}

export default App;
