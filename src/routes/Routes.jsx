import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import IndexPage from "../pages/IndexPage";
import RouteSegmentPage from "../pages/RouteSegmentPage";

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <IndexPage />
        </Route>
        <Route exact path="/route-network">
          <RouteSegmentPage />
        </Route>
      </Switch>
    </Router>
  );
};

export default Routes;
