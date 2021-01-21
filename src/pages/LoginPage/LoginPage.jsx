import * as React from "react";
import { useCallback } from "react";
import { Redirect, useLocation } from "react-router-dom";

import { useKeycloak } from "@react-keycloak/web";

const LoginPage = () => {
  const location = useLocation();
  const currentLocationState = location.state || {
    from: { pathname: "/" },
  };

  const { keycloak, initialized } = useKeycloak();

  if (!initialized) return <div>Loading</div>;

  const login = useCallback(() => {
    keycloak.login();
  }, [keycloak]);

  if (keycloak.authenticated)
    return <Redirect to={currentLocationState.from} />;

  return (
    <div>
      <button type="button" onClick={login}>
        Login
      </button>
    </div>
  );
};

export default LoginPage;
