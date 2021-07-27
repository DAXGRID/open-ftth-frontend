import { useQuery } from "urql";
import {
  PROJECT_AND_WORK_TASKS_QUERY,
  ProjectAndWorkTasksResponse,
  SET_CURRENT_WORK_TASK,
  WorkTask,
} from "./WorkTasksGql";

function WorkTasks() {
  const [projectAndWorksTasksResponse] = useQuery<ProjectAndWorkTasksResponse>({
    query: PROJECT_AND_WORK_TASKS_QUERY,
  });

  const projectsAndWorksTasks =
    projectAndWorksTasksResponse.data?.workService.projectsAndWorkTasks;

  return <div>Work task is here</div>;
}

export default WorkTasks;
