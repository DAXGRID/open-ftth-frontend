import { Redirect, useLocation } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import Loading from "../../components/Loading";

const LoginPage = () => {
  const location = useLocation<{ [key: string]: unknown }>();
  const currentLocationState = location.state || {
    from: { pathname: "/" },
  };

  const auth = useAuth();

  if (auth.isLoading) return <Loading />;

  if (auth.isAuthenticated)
    return <Redirect to={currentLocationState?.from as string} />;

  auth.signinRedirect();

  return <></>;
};

export default LoginPage;
