interface Geometry {
  coordinates: string;
  type: string;
}

export interface WorkTask {
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
}

interface ProjectAndWorkTasks {
  mRID?: string;
  name?: string;
  workTasks: WorkTask[];
}

interface WorkService {
  projectsAndWorkTasks: ProjectAndWorkTasks[];
}

export interface ProjectAndWorkTasksResponse {
  workService: WorkService;
}

export const PROJECT_AND_WORK_TASKS_QUERY = `query {
  workService {
    projectsAndWorkTasks {
      mRID
      name
      workTasks {
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

export const SET_CURRENT_WORK_TASK = `mutation ($userName: String!, $workTaskId: ID!) {
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
