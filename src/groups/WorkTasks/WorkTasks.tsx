import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "urql";
import {
  PROJECT_AND_WORK_TASKS_QUERY,
  ProjectAndWorkTasksResponse,
  SET_CURRENT_WORK_TASK,
  WorkTask,
  ProjectAndWorkTasks,
} from "./WorkTasksGql";
import SelectMenu, { SelectOption } from "../../components/SelectMenu";
import SelectListView, { BodyItem } from "../../components/SelectListView";
import Loading from "../../components/Loading";

interface WorkTaskBodyItem extends BodyItem {
  collectionId: string;
  workTask: WorkTask;
}

function projectSelectOptions(projects: ProjectAndWorkTasks[]): SelectOption[] {
  return projects.map<SelectOption>((x) => {
    return { text: x.name ?? "", value: x.mRID ?? "" };
  });
}

function createWorkTaskBodyItems(
  projects: ProjectAndWorkTasks[]
): WorkTaskBodyItem[] {
  return projects.flatMap((p) => {
    return p.workTasks.map<WorkTaskBodyItem>((w) => {
      return {
        collectionId: p.mRID ?? "",
        id: w.mRID ?? "",
        rows: [
          {
            id: 0,
            value: w.name ? w.name : "",
          },
          {
            id: 1,
            value: w.centralOfficeArea ? w.centralOfficeArea : "",
          },
          {
            id: 2,
            value: w.flexPointArea ? w.flexPointArea : "",
          },
          {
            id: 3,
            value: w.splicePointArea ? w.splicePointArea : "",
          },
          {
            id: 4,
            value: w.technology ? w.technology : "",
          },
          {
            id: 5,
            value: w.workTaskType ? w.workTaskType : "",
          },
          {
            id: 6,
            value: w.addressString ? w.addressString : "",
          },
          {
            id: 7,
            value: w.status ? w.status : "",
          },
        ],
        workTask: w,
      };
    });
  });
}

function WorkTasks() {
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState<string>();
  const [selectedWorkTask, setSelectedWorkTask] = useState<string>();
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

  useEffect(() => {
    setSelectedWorkTask("");
  }, [selectedProject, setSelectedWorkTask]);

  const selectItem = (x: BodyItem) => {
    setSelectedWorkTask(x.id as string);
  };

  if (projectsResponse.fetching) return <Loading />;

  return (
    <div>
      <div className="full-row">
        <SelectMenu
          onSelected={(x) => setSelectedProject(x as string)}
          selected={selectedProject}
          options={projectSelectOptions(projects)}
        />
      </div>
      <div className="full-row">
        <SelectListView
          headerItems={[
            t("Name"),
            t("Central office area"),
            t("Flex point area"),
            t("Splice point area"),
            t("Technology"),
            t("Work task type"),
            t("Address"),
            t("Status"),
          ]}
          bodyItems={createWorkTaskBodyItems(projects).filter(
            (x) => x.collectionId === selectedProject
          )}
          selectItem={selectItem}
          selected={selectedWorkTask}
        />
      </div>
    </div>
  );
}

export default WorkTasks;
