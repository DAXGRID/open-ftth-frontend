import { createContext, ReactNode, useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import useUserWorkContext, { UserWorkTask } from "./useUserWorkContext";

type UserContextType = {
  userName: string;
  userWorkTask: UserWorkTask | null;
};

const UserContext = createContext<UserContextType>({
  userName: "",
  userWorkTask: null,
});

type UserContextProps = {
  children: ReactNode;
};

const UserProvider = ({ children }: UserContextProps) => {
  const [userName, setUsername] = useState<string>("");
  const { initialized, keycloak } = useKeycloak();
  const userWorkTask = useUserWorkContext(userName);

  useEffect(() => {
    if (!initialized) return;
    keycloak.loadUserProfile().then(() => {
      if (!keycloak.profile?.username)
        throw new Error("Could not load user from keycloak.");
      else setUsername(keycloak.profile.username);
    });
  }, [initialized, keycloak]);

  return (
    <UserContext.Provider
      value={{
        userName: userName,
        userWorkTask: userWorkTask ?? null,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
