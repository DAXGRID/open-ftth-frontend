import { Redirect, useLocation } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import Loading from "../../components/Loading";

const LoginPage = () => {
  const location = useLocation<{ [key: string]: unknown }>();
  const currentLocationState = location.state || {
    from: { pathname: "/" },
  };

  const { keycloak, initialized } = useKeycloak();

  if (!initialized) return <Loading />;

  if (keycloak.authenticated)
    return <Redirect to={currentLocationState?.from as string} />;

  keycloak.login();

  return <></>;
};

export default LoginPage;
