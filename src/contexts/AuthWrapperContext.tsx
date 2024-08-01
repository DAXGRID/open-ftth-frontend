import {
  createContext,
  ReactNode,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Client,
  subscriptionExchange,
  Provider,
  Operation,
  makeOperation,
  fetchExchange,
} from "urql";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { useAuth } from "react-oidc-context";
import Config from "../config";
import { authExchange } from "@urql/exchange-auth";

type AuthWrapperContextType = {};

const AuthWrapperContext = createContext<AuthWrapperContextType>({});

type AuthWrapperProviderProps = {
  children: ReactNode;
};

const AuthWrapperProvider = ({ children }: AuthWrapperProviderProps) => {
  const auth = useAuth();
  const [userLoaded, setUserLoaded] = useState<boolean>(false);
  const accessToken = useRef<string | null>(null);

  // HACK. This is done because we do not want to create a new client,
  // because if we do make a new client, the whole website refreshes everytime
  // a new user is being loaded.
  useEffect(() => {
    if (auth.user) {
      accessToken.current = auth.user.access_token;
      setUserLoaded(true);
    }
  }, [auth.user]);

  const client = useMemo(() => {
    if (!userLoaded) {
      return null;
    }

    if (!accessToken.current) {
      return null;
    }

    const subscriptionClient = new SubscriptionClient(
      `${Config.API_GATEWAY_WS_URI}/graphql`,
      {
        lazy: false,
        reconnect: true,
        connectionParams: async () => {
          return {
            Authorization: `Bearer ${accessToken.current}`,
          };
        },
      },
    );

    const withAuthHeader = (operation: Operation, token: string) => {
      const fetchOptions =
        typeof operation.context.fetchOptions === "function"
          ? operation.context.fetchOptions()
          : operation.context.fetchOptions || {};

      return makeOperation(operation.kind, operation, {
        ...operation.context,
        fetchOptions: {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            Authorization: token,
          },
        },
      });
    };

    const getAuth = async () => {
      if (!accessToken.current) {
        return null;
      }

      return { token: `Bearer ${accessToken.current}` };
    };

    const client = new Client({
      url: `${Config.API_GATEWAY_HTTP_URI}/graphql`,
      requestPolicy: "network-only",
      exchanges: [
        authExchange({
          getAuth: getAuth,
          didAuthError: ({ error }) => {
            return error.graphQLErrors.some(
              (e) => e.extensions?.code === "ACCESS_DENIED",
            );
          },
          addAuthToOperation: ({ authState, operation }) => {
            return withAuthHeader(operation, authState!.token);
          },
        }),
        fetchExchange,
        subscriptionExchange({
          forwardSubscription: (operation) =>
            subscriptionClient.request(operation),
        }),
      ],
    });

    return client;
  }, [userLoaded]);

  if (auth.isLoading) {
    return <></>;
  }

  if (auth.error) {
    return <div>Failed to authorize the user: {auth.error.message}</div>;
  }

  if (!auth.isAuthenticated) {
    auth.signinRedirect();
  }

  if (client === null) {
    return <></>;
  }

  return (
    <AuthWrapperContext.Provider value={{}}>
      <Provider value={client}>{children}</Provider>
    </AuthWrapperContext.Provider>
  );
};

export { AuthWrapperContext, AuthWrapperProvider };
