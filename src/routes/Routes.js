import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import IndexPage from "../pages/IndexPage";

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <IndexPage />
        </Route>
      </Switch>
    </Router>
  );
};

export default Routes;
