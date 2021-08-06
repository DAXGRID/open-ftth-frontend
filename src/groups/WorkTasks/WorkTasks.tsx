import { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useKeycloak } from "@react-keycloak/web";
import { useQuery, useMutation } from "urql";
import { UserContext } from "../../contexts/UserContext";
import useBridgeConnector from "../../bridge/useBridgeConnector";
import {
  PROJECT_AND_WORK_TASKS_QUERY,
  ProjectAndWorkTasksResponse,
  SET_CURRENT_WORK_TASK_MUTATION,
  WorkTask,
  ProjectAndWorkTasks,
} from "./WorkTasksGql";

import SelectMenu, { SelectOption } from "../../components/SelectMenu";
import SelectListView, { BodyItem } from "../../components/SelectListView";
import DefaultButton from "../../components/DefaultButton";
import Loading from "../../components/Loading";
import { toast } from "react-toastify";

interface WorkTaskBodyItem extends BodyItem {
  collectionId: string;
  workTask: WorkTask;
}

function createProjectSelectOptions(
  projects: ProjectAndWorkTasks[]
): SelectOption[] {
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
  const { keycloak } = useKeycloak();
  const { reloadUserWorkTask } = useContext(UserContext);
  const { panToCoordinate } = useBridgeConnector();
  const [selectedProject, setSelectedProject] = useState<string>();
  const [selectedWorkTask, setSelectedWorkTask] = useState<string>();
  const [projects, setProjects] = useState<ProjectAndWorkTasks[]>([]);
  const [projectsResponse] = useQuery<ProjectAndWorkTasksResponse>({
    query: PROJECT_AND_WORK_TASKS_QUERY,
  });
  const [setCurrentWorkTaskResult, setCurrentWorkTask] = useMutation(
    SET_CURRENT_WORK_TASK_MUTATION
  );

  useEffect(() => {
    if (!projectsResponse?.data) return;
    const projectsAndWorksTasks =
      projectsResponse.data.workService.projectsAndWorkTasks;
    setProjects(projectsAndWorksTasks);
    if (!selectedProject) {
      setSelectedProject(projectsAndWorksTasks[0].mRID ?? "");
    }
  }, [projectsResponse, selectedProject, setSelectedProject, setProjects]);

  useEffect(() => {
    setSelectedWorkTask("");
  }, [selectedProject, setSelectedProject]);

  useEffect(() => {
    if (!setCurrentWorkTaskResult?.data) return;
    if (!setCurrentWorkTaskResult.error) {
      toast.success(t("Work task is now added to user"));
      reloadUserWorkTask();
    } else {
      toast.error(setCurrentWorkTaskResult.error.message);
    }
  }, [setCurrentWorkTaskResult, t, reloadUserWorkTask]);

  const workTaskBodyItems = useMemo(
    () =>
      createWorkTaskBodyItems(projects).filter(
        (x) => x.collectionId === selectedProject
      ),
    [projects, selectedProject]
  );

  const projectSelectOptions = useMemo(
    () => createProjectSelectOptions(projects),
    [projects]
  );

  const selectItem = useCallback(
    (x: BodyItem) => {
      setSelectedWorkTask(x.id as string);
    },
    [setSelectedWorkTask]
  );

  const pickWorkTask = useCallback(() => {
    if (!selectedWorkTask || !keycloak.profile?.username) return;
    setCurrentWorkTask({
      userName: keycloak.profile?.username,
      workTaskId: selectedWorkTask,
    });
  }, [setCurrentWorkTask, selectedWorkTask, keycloak.profile?.username]);

  const panToAddress = () => {
    const workTask = workTaskBodyItems.find(
      (x) => x.workTask.mRID === selectedWorkTask
    )?.workTask;

    if (!workTask) {
      toast.warning(t("Please select a work task"));
    }
    if (!workTask?.geometry?.coordinates) {
      toast.warning(t("The work task has no coordinates"));
      return;
    }

    panToCoordinate(workTask.geometry.coordinates);
    toast.success(t("Pan/Zoom to address"));
  };

  if (projectsResponse.fetching) return <Loading />;

  return (
    <div>
      <div className="full-row">
        <SelectMenu
          onSelected={(x) => setSelectedProject(x as string)}
          selected={selectedProject}
          options={projectSelectOptions}
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
          bodyItems={workTaskBodyItems}
          selectItem={selectItem}
          selected={selectedWorkTask}
        />
      </div>
      <div className="full-row">
        <DefaultButton
          innerText={t("Pick work task")}
          onClick={pickWorkTask}
          disabled={!selectedWorkTask}
        />
        <DefaultButton
          innerText={t("Pan/Zoom to address")}
          onClick={panToAddress}
          disabled={!selectedWorkTask}
        />
      </div>
    </div>
  );
}

export default WorkTasks;
