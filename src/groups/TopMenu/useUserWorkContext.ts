import { useState, useEffect } from "react";
import { useQuery } from "urql";
import { useKeycloak } from "@react-keycloak/web";

const USER_WORK_CONTEXT_QUERY = `
query ($userName: String!) {
  workService {
    userWorkContext(userName: $userName) {
      userName
      currentWorkTask {
        name
      }
    }
  }
}`;

interface UserWorkContext {
  userName: string;
  currentWorkTask: {
    name: string;
  };
}

interface UserWorkContextQueryResponse {
  workService: {
    userWorkContext: UserWorkContext;
  };
}

function useUserWorkContext() {
  const [userWorkContext, setUserWorkContext] = useState<UserWorkContext>();
  const { keycloak } = useKeycloak();

  const [response] = useQuery<UserWorkContextQueryResponse>({
    query: USER_WORK_CONTEXT_QUERY,
    variables: {
      userName: keycloak.profile?.username,
    },
    pause: !keycloak.profile?.username,
  });

  useEffect(() => {
    if (!response.data) return;
    setUserWorkContext(response.data.workService.userWorkContext);
  }, [response]);

  return userWorkContext;
}

export default useUserWorkContext;
