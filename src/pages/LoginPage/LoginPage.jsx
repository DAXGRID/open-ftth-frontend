import React from "react";
import { Redirect, useLocation } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";

const LoginPage = () => {
  const location = useLocation();
  const currentLocationState = location.state || {
    from: { pathname: "/" },
  };

  const { keycloak, initialized } = useKeycloak();

  if (!initialized) return <div>Loading</div>;

  if (keycloak.authenticated)
    return <Redirect to={currentLocationState.from} />;

  keycloak.login();

  return <></>;
};

export default LoginPage;
