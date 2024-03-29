import React from "react";
import { useContext } from "react";
import { Route, Redirect, RouteComponentProps } from "react-router-dom";
import type { RouteProps } from "react-router-dom";
import { UserContext, UserRolesType } from "../contexts/UserContext";
import Unauthorized from "./Unauthorized";

interface PrivateRouteParams extends RouteProps {
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  roles: UserRolesType[];
}

function PrivateRoute({
  component: Component,
  roles,
  ...rest
}: PrivateRouteParams) {
  const { hasRoles, authenticated } = useContext(UserContext);

  return (
    <Route
      {...rest}
      render={(props) =>
        authenticated ? (
          hasRoles(...roles) ? (
            // Has required roles we render the component.
            <Component {...props} />
          ) : (
            <Unauthorized />
          )
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
}

export default PrivateRoute;
