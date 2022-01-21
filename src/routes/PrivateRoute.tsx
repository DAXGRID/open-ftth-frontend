import { useContext } from "react";
import { Route, Redirect, RouteComponentProps } from "react-router-dom";
import type { RouteProps } from "react-router-dom";
import { UserContext, UserRolesType } from "../contexts/UserContext";

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

  if (!hasRoles(roles)) return <></>;

  return (
    <Route
      {...rest}
      render={(props) =>
        authenticated ? (
          <Component {...props} />
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
