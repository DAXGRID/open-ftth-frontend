export const projectsAndWorkTasks = `query {
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
