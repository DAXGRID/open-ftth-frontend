import { useState, useEffect } from "react";
import { useQuery } from "urql";

const USER_WORK_CONTEXT_QUERY = `
query ($userName: String!) {
  workService {
    userWorkContext(userName: $userName) {
      currentWorkTask {
        id
        type
        status
        name
        subtaskName
        number
      }
    }
  }
}`;

export type UserWorkTask = {
  id: string;
  type: string;
  name?: string;
  status?: string;
  subtaskName: string;
  number: string;
};

type UserWorkContextQueryResponse = {
  workService: {
    userWorkContext: {
      currentWorkTask: UserWorkTask;
    };
  };
};

function useUserWorkContext(userName: string) {
  const [userWorkContext, setUserWorkContext] = useState<UserWorkTask>();
  const [userWorkContextQuery, reExecuteUserWorkContextQuery] =
    useQuery<UserWorkContextQueryResponse>({
      query: USER_WORK_CONTEXT_QUERY,
      variables: {
        userName: userName,
      },
      pause: !userName,
    });

  useEffect(() => {
    if (
      !userWorkContextQuery.data?.workService?.userWorkContext?.currentWorkTask
    )
      return;
    setUserWorkContext(
      userWorkContextQuery.data.workService.userWorkContext.currentWorkTask
    );
  }, [userWorkContextQuery]);

  return { userWorkContext, reExecuteUserWorkContextQuery };
}

export default useUserWorkContext;
