import { Client } from "urql";

export function getWorksTasks(client: Client) {
  return client.query<WorkTasksResponse>(QUERY_WORK_TASKS, {}).toPromise();
}

export function setCurrentWorkTaskToUser(
  client: Client,
  params: SetCurrentWorkTaskParams
) {
  return client.mutation(SET_CURRENT_WORK_TASK, params).toPromise();
}

export interface WorkTask {
  workTaskId: string;
  projectNumber: string | null;
  projectName: string | null;
  number: string;
  type: string;
  status: string;
  name: string | null;
  subtask: string | null;
  owner: string | null;
  areaId: string | null;
  createdDate: string;
  installationId: string | null;
  modifiedBy: string | null;
  geometry: {
    coordinates: string;
    type: string;
  } | null;
}

interface SetCurrentWorkTaskParams {
  userName: string;
  workTaskId: string;
}

const SET_CURRENT_WORK_TASK = `
mutation ($userName: String!, $workTaskId: ID!) {
  userContext {
    setCurrentWorkTask(userName: $userName, workTaskId: $workTaskId)
    {
      currentWorkTask {
        __typename
      }
      userName
    }
  }
}`;

interface WorkTasksResponse {
  workService: {
    workTasksWithProjectInformation: WorkTask[];
  };
}

const QUERY_WORK_TASKS = `
query {
  workService {
    workTasksWithProjectInformation {
      workTaskId
      projectId
      projectNumber
      projectName
      projectOwner
      projectType
      projectStatus
      number
      createdDate
      name
      subtaskName
      type
      status
      owner
      installationId
      areaId
      unitAddressId
      geometry {
        type
        coordinates
      }
      modifiedBy
    }
  }
}`;
