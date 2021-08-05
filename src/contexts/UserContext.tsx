import { createContext, ReactNode, useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";

type UserContextType = {
  userName: string;
};

const UserContext = createContext<UserContextType>({
  userName: "",
});

type UserContextProps = {
  children: ReactNode;
};

const UserProvider = ({ children }: UserContextProps) => {
  const [userName, setUsername] = useState<string>("");
  const { initialized, keycloak } = useKeycloak();

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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
