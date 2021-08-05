import { useState, useEffect } from "react";
import { useQuery } from "urql";

const USER_WORK_CONTEXT_QUERY = `
query ($userName: String!) {
  workService {
    userWorkContext(userName: $userName) {
      currentWorkTask {
        mRID
        workTaskType
        name
        status
        addressString
        centralOfficeArea
        flexPointArea
        splicePointArea
        installationId
        technology
        geometry {
          coordinates
          type
        }
      }
    }
  }
}`;

type Geometry = {
  coordinates: string;
  type: string;
};

export type UserWorkTask = {
  mRID: string;
  workTaskType: string;
  name?: string;
  status?: string;
  addressString?: string;
  centralOfficeArea?: string;
  flexPointArea?: string;
  splicePointArea?: string;
  installationId?: string;
  technology?: string;
  geometry?: Geometry;
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
  const [response] = useQuery<UserWorkContextQueryResponse>({
    query: USER_WORK_CONTEXT_QUERY,
    variables: {
      userName: userName,
    },
    pause: !userName,
  });

  useEffect(() => {
    if (!response.data) return;
    setUserWorkContext(
      response.data.workService.userWorkContext.currentWorkTask
    );
  }, [response]);

  return userWorkContext;
}

export default useUserWorkContext;
