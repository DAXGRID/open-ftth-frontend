import React from "react";
import { Switch, Route } from "react-router-dom";
import IndexPage from "../pages/IndexPage";
import PlaceTubesPage from "../pages/PlaceTubesPage";
import WorkTaskPage from "../pages/WorkTaskPage";
import IdentifyFeaturesPage from "../pages/IdentifyFeaturePage";

const Routes = () => (
  <Switch>
    <Route exact path="/">
      <IndexPage />
    </Route>
    <Route exact path="/place-tubes">
      <PlaceTubesPage />
    </Route>
    <Route exact path="/work-task">
      <WorkTaskPage />
    </Route>
    <Route exact path="/identify-feature/:id">
      <IdentifyFeaturesPage />
    </Route>
  </Switch>
);

export default Routes;
