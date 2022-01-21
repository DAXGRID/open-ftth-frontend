import { Switch, Route } from "react-router-dom";
import IndexPage from "../pages/IndexPage";
import PlaceSpanEquipmentPage from "../pages/PlaceSpanEquipmentPage";
import LoginPage from "../pages/LoginPage";
import IdentifyFeaturesPage from "../pages/IdentifyFeaturePage";
import WorkTaskPage from "../pages/WorkTaskPage";
import PrivateRoute from "./PrivateRoute";

const Routes = () => (
  <Switch>
    <PrivateRoute roles={["reader"]} exact path="/" component={IndexPage} />
    <PrivateRoute
      roles={["writer", "reader"]}
      exact
      path="/place-span-equipment"
      component={PlaceSpanEquipmentPage}
    />
    <PrivateRoute
      roles={["writer", "reader"]}
      exact
      path="/schematic-diagram/:id?"
      component={IdentifyFeaturesPage}
    />
    <PrivateRoute
      roles={["writer", "reader"]}
      exact
      path="/work-tasks/"
      component={WorkTaskPage}
    />
    <Route exact path="/login" component={LoginPage} />
  </Switch>
);

export default Routes;
