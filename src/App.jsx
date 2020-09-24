import React from "react";
import Routes from "./routes/Routes";
import TopMenu from "./components/TopMenu";

function App() {
  return (
    <div>
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
