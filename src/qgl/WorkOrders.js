export const ProjectsAndWorkTasks = `query {
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

export const SetCurrentWorkTask = `mutation ($userName: String!, $workTaskId: ID!) {
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
