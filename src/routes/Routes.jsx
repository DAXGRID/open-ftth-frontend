import React from "react";
import { Switch, Route } from "react-router-dom";
import IndexPage from "../pages/IndexPage";
import RouteSegmentPage from "../pages/RouteSegmentPage";

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/">
        <IndexPage />
      </Route>
      <Route exact path="/route-segment">
        <RouteSegmentPage />
      </Route>
    </Switch>
  );
};

export default Routes;
