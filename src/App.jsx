import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './routes/Routes';
import TopMenu from './components/TopMenu';
import BridgeConnector from './bridge/BridgeConnector';
import BridgeRouter from './bridge/BridgeRouter';
import SideMenu from './components/SideMenu';

function App() {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const toggleSideMenu = () => {
    setSideMenuOpen(!sideMenuOpen);
    // Hack to allow rezing of some components
    window.dispatchEvent(new Event('resize'));
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
          sideMenuOpen ? 'main-container side-menu-open' : 'main-container'
        }
      >
        <Routes />
      </main>
    </Router>
  );
}

export default App;
