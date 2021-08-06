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
};

const UserContext = createContext<UserContextType>({
  userName: "",
  userWorkTask: null,
  reloadUserWorkTask: () => {
    console.warn("no provider set for reloadUserWorkTask");
  },
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
      if (!keycloak.profile?.username)
        throw new Error("Could not load user from keycloak.");
      else setUsername(keycloak.profile.username);
    });
  }, [initialized, keycloak]);

  const reloadUserWorkTask = useCallback(() => {
    reExecuteUserWorkContextQuery();
  }, [reExecuteUserWorkContextQuery]);

  return (
    <UserContext.Provider
      value={{
        userName: userName,
        userWorkTask: userWorkContext ?? null,
        reloadUserWorkTask: reloadUserWorkTask,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
