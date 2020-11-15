import React from "react";
import { Switch, Route } from "react-router-dom";
import IndexPage from "../pages/IndexPage";
import PlaceTubesPage from "../pages/PlaceTubesPage";
import SchematicDiagramPage from "../pages/SchematicDiagramPage";

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/">
        <IndexPage />
      </Route>
      <Route exact path="/place-tubes">
        <PlaceTubesPage />
      </Route>
      <Route exact path="/schematic-diagram">
        <SchematicDiagramPage />
      </Route>
    </Switch>
  );
};

export default Routes;
