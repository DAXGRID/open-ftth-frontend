import { useState, useEffect } from "react";
import { useQuery, useMutation } from "urql";
import { useTranslation } from "react-i18next";
import SelectListView, { BodyItem } from "../../components/SelectListView";
import DefaultButton from "../../components/DefaultButton";
import SelectMenu, { SelectOption } from "../../components/SelectMenu";
import Notification, { NotificationProps } from "../../components/Notification";
import {
  PROJECT_AND_WORK_TASKS,
  SET_CURRENT_WORK_TASK,
  ProjectAndWorkTasksData,
  WorkTask,
} from "../../qgl/WorkOrders";
import useBridgeConnector from "../../bridge/useBridgeConnector";
import Loading from "../../components/Loading";

interface WorkTaskBodyItem extends BodyItem {
  collectionId?: string;
  workTask: WorkTask;
}

function WorkTaskPage() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<SelectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<SelectOption>();
  const [workTasks, setWorkTasks] = useState<WorkTaskBodyItem[]>([]);
  const [validation, setValidation] = useState<NotificationProps>({});
  const [currentWorkTaskResult, setCurrentWorkTask] = useMutation(
    SET_CURRENT_WORK_TASK
  );
  const [result] = useQuery<ProjectAndWorkTasksData>({
    query: PROJECT_AND_WORK_TASKS,
  });
  const { fetching } = result;

  const onSelected = (selected: SelectOption | undefined) => {
    if (!selected) return;
    setSelectedProject(selected);
  };

  useEffect(() => {
    const { data } = result;
    if (!data) return;
    const projects = data.workService.projectsAndWorkTasks;

    const selectableProjects: SelectOption[] = [];
    const selectableWorkTasks: WorkTaskBodyItem[] = [];

    projects.forEach((p) => {
      selectableProjects.push({
        text: p.name ? p.name : "",
        selected: false,
        value: p.mRID ? p.mRID : "",
      });

      p.workTasks.forEach((w) => {
        const selectableWorkTask: WorkTaskBodyItem = {
          rows: [],
          id: w.mRID,
          selected: false,
          collectionId: p.mRID,
          workTask: w,
        };

        selectableWorkTask.rows.push({ id: 0, value: w.name ? w.name : "" });
        selectableWorkTask.rows.push({
          id: 1,
          value: w.centralOfficeArea ? w.centralOfficeArea : "",
        });
        selectableWorkTask.rows.push({
          id: 2,
          value: w.flexPointArea ? w.flexPointArea : "",
        });
        selectableWorkTask.rows.push({
          id: 3,
          value: w.splicePointArea ? w.splicePointArea : "",
        });
        selectableWorkTask.rows.push({
          id: 4,
          value: w.technology ? w.technology : "",
        });
        selectableWorkTask.rows.push({
          id: 5,
          value: w.workTaskType ? w.workTaskType : "",
        });
        selectableWorkTask.rows.push({
          id: 6,
          value: w.addressString ? w.addressString : "",
        });
        selectableWorkTask.rows.push({
          id: 7,
          value: w.status ? w.status : "",
        });

        selectableWorkTasks.push(selectableWorkTask);
      });
    });

    selectableProjects[0].selected = true;
    setProjects(selectableProjects);
    setWorkTasks(selectableWorkTasks);
  }, [result]);

  const selectItem = (selectedItem: BodyItem) => {
    workTasks.forEach((x) => (x.selected = false));
    selectedItem.selected = true;
    setWorkTasks([...workTasks]);
  };

  const pickWorkTask = async () => {
    const selectedWorkTask = workTasks.find((x) => x.selected);

    if (!selectedWorkTask) {
      setValidation({
        type: "error",
        headerText: t("Error"),
        bodyText: t("Please select a work task"),
      });

      return;
    }

    const parameters = {
      userName: "user",
      workTaskId: selectedWorkTask.id,
    };

    var result = await setCurrentWorkTask(parameters);
    if (!result.error) {
      setValidation({
        type: "success",
        headerText: t("Success"),
        bodyText: `${t("Work task is now added to user")}: ${
          result.data.userContext.setCurrentWorkTask.userName
        }`,
      });
    } else {
      setValidation({
        type: "error",
        headerText: t("Error"),
        bodyText: result.error.message,
      });
    }
  };

  if (fetching) {
    return <Loading />;
  }

  return (
    <div>
      <div className="full-row">
        <Notification
          type={validation.type}
          headerText={validation.headerText}
          bodyText={validation.bodyText}
        />
      </div>
      <div className="full-row">
        <SelectMenu
          maxWidth="400px"
          options={projects}
          onSelected={onSelected}
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
          bodyItems={workTasks.filter(
            (x) => x.collectionId === selectedProject?.value
          )}
          selectItem={selectItem}
        />
      </div>
      <div className="full-row">
        <DefaultButton
          maxWidth="400px"
          innerText={t("Pick work task")}
          onClick={pickWorkTask}
        />
        <DefaultButton
          maxWidth="400px"
          innerText={t("Pan/Zoom to address")}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

export default WorkTaskPage;
