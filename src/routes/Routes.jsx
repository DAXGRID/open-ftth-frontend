import React from "react";
import { Switch, Route } from "react-router-dom";
import IndexPage from "../pages/IndexPage";
import PlaceTubesPage from "../pages/PlaceTubesPage";

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/">
        <IndexPage />
      </Route>
      <Route exact path="/place-tubes">
        <PlaceTubesPage />
      </Route>
    </Switch>
  );
};

export default Routes;
