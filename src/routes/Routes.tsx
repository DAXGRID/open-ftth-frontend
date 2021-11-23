import { Switch, Route } from "react-router-dom";
import IndexPage from "../pages/IndexPage";
import PlaceSpanEquipmentPage from "../pages/PlaceSpanEquipmentPage";
import LoginPage from "../pages/LoginPage";
import IdentifyFeaturesPage from "../pages/IdentifyFeaturePage";
import WorkTaskPage from "../pages/WorkTaskPage";
import TerminalEquipmentPage from "../pages/TerminalEquipmentPage";
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
      path="/schematic-diagram/:id?"
      component={IdentifyFeaturesPage}
    />
    <PrivateRoute exact path="/work-tasks/" component={WorkTaskPage} />
    <PrivateRoute
      exact
      path="/terminal-equipment/"
      component={TerminalEquipmentPage}
    />
    <Route exact path="/login" component={LoginPage} />
  </Switch>
);

export default Routes;
