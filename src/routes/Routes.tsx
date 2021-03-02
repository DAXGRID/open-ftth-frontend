import React from "react";
import { Switch, Route } from "react-router-dom";
import IndexPage from "../pages/IndexPage";
import PlaceSpanEquipmentPage from "../pages/PlaceSpanEquipmentPage";
import LoginPage from "../pages/LoginPage";
import IdentifyFeaturesPage from "../pages/IdentifyFeaturePage";
import PrivateRoute from "./utils";

const Routes = () => (
  <Switch>
    <PrivateRoute exact path="/" component={IndexPage} />
    <PrivateRoute
      exact
      path="/place-span-equipment"
      component={PlaceSpanEquipmentPage}
    />
    <PrivateRoute
      exact
      path="/identify-feature/:id"
      component={IdentifyFeaturesPage}
    />
    <Route exact path="/login" component={LoginPage} />
  </Switch>
);

export default Routes;
