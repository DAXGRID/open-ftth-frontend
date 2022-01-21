import {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useKeycloak } from "@react-keycloak/web";
import useUserWorkContext, { UserWorkTask } from "./useUserWorkContext";

const RESOURCE_NAME = "openftth-frontend";
type UserRolesType = "reader" | "writer";

type UserContextType = {
  userName: string;
  userWorkTask: UserWorkTask | null;
  reloadUserWorkTask: () => void;
  hasRole: (roleName: UserRolesType) => boolean;
  authenticated: boolean;
};

const UserContext = createContext<UserContextType>({
  userName: "",
  userWorkTask: null,
  reloadUserWorkTask: () => {
    console.warn("No provider set for reloadUserWorkTask");
  },
  hasRole: (_: UserRolesType): boolean => {
    throw new Error("No provider set for hasRole");
  },
  authenticated: false,
});

type UserContextProps = {
  children: ReactNode;
};

const UserProvider = ({ children }: UserContextProps) => {
  const [userName, setUsername] = useState<string>("");
  const { initialized, keycloak } = useKeycloak();
  const { userWorkContext, reExecuteUserWorkContextQuery } =
    useUserWorkContext(userName);

  useEffect(() => {
    if (!initialized) return;
    keycloak.loadUserProfile().then(() => {
      console.log(keycloak);
      if (!keycloak.profile?.username) {
        throw new Error("Could not load user from keycloak.");
      } else {
        setUsername(keycloak.profile.username);
      }
    });
  }, [initialized, keycloak, setUsername]);

  const hasRole = useCallback(
    (roleName: UserRolesType): boolean => {
      return keycloak.hasResourceRole(roleName, RESOURCE_NAME);
    },
    [keycloak]
  );

  const authenticated = useMemo((): boolean => {
    return keycloak?.authenticated ?? false;
  }, [keycloak?.authenticated]);

  const reloadUserWorkTask = useCallback(() => {
    reExecuteUserWorkContextQuery();
  }, [reExecuteUserWorkContextQuery]);

  return (
    <UserContext.Provider
      value={{
        userName: userName,
        userWorkTask: userWorkContext ?? null,
        reloadUserWorkTask: reloadUserWorkTask,
        hasRole: hasRole,
        authenticated: authenticated,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
export type { UserRolesType };
