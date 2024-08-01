import {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import useUserWorkContext, { UserWorkTask } from "./useUserWorkContext";
import { useAuth } from "react-oidc-context";

type UserRolesType = "reader" | "writer";

type UserContextType = {
  userName: string;
  userWorkTask: UserWorkTask | null;
  reloadUserWorkTask: () => void;
  hasRoles: (...roles: UserRolesType[]) => boolean;
  authenticated: boolean;
};

const UserContext = createContext<UserContextType>({
  userName: "",
  userWorkTask: null,
  reloadUserWorkTask: () => {
    console.warn("No provider set for reloadUserWorkTask");
  },
  hasRoles: (..._: UserRolesType[]): boolean => {
    throw new Error("No provider set for hasRole");
  },
  authenticated: false,
});

type UserContextProps = {
  children: ReactNode;
};

const UserProvider = ({ children }: UserContextProps) => {
  const [userName, setUsername] = useState<string>("");
  const auth = useAuth();
  const { userWorkContext, reExecuteUserWorkContextQuery } =
    useUserWorkContext(userName);

  useEffect(() => {
    if (auth.isLoading) return;

    if (auth.isAuthenticated) {
      setUsername(auth.user?.profile.preferred_username ?? "");
    }
  }, [
    auth.isAuthenticated,
    setUsername,
    auth.isLoading,
    auth.user?.profile.preferred_username,
  ]);

  const hasRoles = useCallback(
    (...roles: UserRolesType[]): boolean => {
      return roles.every((userRole) =>
        (
          auth.user?.profile.openftth_frontend as { roles: string[] } | null
        )?.roles.find((role: string) => role === userRole),
      );
    },
    [auth.user],
  );

  const authenticated = useMemo((): boolean => {
    return auth.isAuthenticated;
  }, [auth.isAuthenticated]);

  const reloadUserWorkTask = useCallback(() => {
    reExecuteUserWorkContextQuery();
  }, [reExecuteUserWorkContextQuery]);

  return (
    <UserContext.Provider
      value={{
        userName: userName,
        userWorkTask: userWorkContext ?? null,
        reloadUserWorkTask: reloadUserWorkTask,
        hasRoles: hasRoles,
        authenticated: authenticated,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
export type { UserRolesType };
