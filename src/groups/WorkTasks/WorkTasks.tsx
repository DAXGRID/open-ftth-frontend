import { useState, useEffect } from "react";
import { useQuery } from "urql";
import {
  PROJECT_AND_WORK_TASKS_QUERY,
  ProjectAndWorkTasksResponse,
  SET_CURRENT_WORK_TASK,
  WorkTask,
  ProjectAndWorkTasks,
} from "./WorkTasksGql";
import SelectMenu, { SelectOption } from "../../components/SelectMenu";
import Loading from "../../components/Loading";

function projectSelectOptions(projects: ProjectAndWorkTasks[]): SelectOption[] {
  return projects.map<SelectOption>((x) => {
    return { text: x.name ?? "", value: x.mRID ?? "" };
  });
}

function WorkTasks() {
  const [selectedProject, setSelectedProject] = useState<string>();
  const [projects, setProjects] = useState<ProjectAndWorkTasks[]>([]);
  const [projectsResponse] = useQuery<ProjectAndWorkTasksResponse>({
    query: PROJECT_AND_WORK_TASKS_QUERY,
  });

  useEffect(() => {
    if (!projectsResponse?.data) return;
    const projectsAndWorksTasks =
      projectsResponse.data.workService.projectsAndWorkTasks;
    setProjects(projectsAndWorksTasks);
    setSelectedProject(projectsAndWorksTasks[0].mRID ?? "");
  }, [projectsResponse, setProjects, setSelectedProject]);

  if (projectsResponse.fetching) return <Loading />;

  return (
    <div>
      <SelectMenu
        onSelected={(x) => setSelectedProject(x as string)}
        selected={selectedProject}
        options={projectSelectOptions(projects)}
      />
    </div>
  );
}

export default WorkTasks;
