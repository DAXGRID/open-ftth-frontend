import {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useKeycloak } from "@react-keycloak/web";
import useUserWorkContext, { UserWorkTask } from "./useUserWorkContext";

type UserContextType = {
  userName: string;
  userWorkTask: UserWorkTask | null;
  reloadUserWorkTask: () => void;
  userRoles: UserRoles;
};

const UserContext = createContext<UserContextType>({
  userName: "",
  userWorkTask: null,
  reloadUserWorkTask: () => {
    console.warn("no provider set for reloadUserWorkTask");
  },
  userRoles: { reader: false, writer: false },
});

type UserContextProps = {
  children: ReactNode;
};

type UserRoles = {
  reader: boolean;
  writer: boolean;
};

const AVAILABLE_ROLES = {
  WRITER: {
    REALM: "openftth-frontend",
    ROLE: "writer",
  },
  READER: {
    RESOURCE: "openftth-frontend",
    ROLE: "reader",
  },
};

const UserProvider = ({ children }: UserContextProps) => {
  const [userName, setUsername] = useState<string>("");
  const [userRoles, setUserRoles] = useState<UserRoles>({
    reader: false,
    writer: false,
  });
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
        const hasRoleReader = keycloak.hasResourceRole(
          AVAILABLE_ROLES.READER.ROLE,
          AVAILABLE_ROLES.READER.RESOURCE
        );
        const hasRoleWriter = keycloak.hasResourceRole(
          AVAILABLE_ROLES.WRITER.ROLE,
          AVAILABLE_ROLES.WRITER.REALM
        );
        setUserRoles({ reader: hasRoleReader, writer: hasRoleWriter });
      }
    });
  }, [initialized, keycloak, setUsername, setUserRoles]);

  const reloadUserWorkTask = useCallback(() => {
    reExecuteUserWorkContextQuery();
  }, [reExecuteUserWorkContextQuery]);

  return (
    <UserContext.Provider
      value={{
        userName: userName,
        userWorkTask: userWorkContext ?? null,
        reloadUserWorkTask: reloadUserWorkTask,
        userRoles: userRoles,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
