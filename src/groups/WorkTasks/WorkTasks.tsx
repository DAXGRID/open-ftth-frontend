import { useEffect, useMemo, useReducer } from "react";
import { useClient } from "urql";
import { useTranslation } from "react-i18next";
import LabelContainer from "../../components/LabelContainer";
import SelectMenu, { SelectOption } from "../../components/SelectMenu";
import DefaultButton from "../../components/DefaultButton";
import SelectListView, { BodyItem } from "../../components/SelectListView";
import { getWorksTasks, WorkTask } from "./WorkTasksGql";

function mapProjectSelectOptions(workTasks: WorkTask[]): SelectOption[] {
  return workTasks.reduce<SelectOption[]>((acc, x) => {
    const notInCollection = !!!acc.find((y) => y.value === x.projectNumber);
    return notInCollection && x.projectName && x.projectNumber
      ? [
          ...acc,
          {
            text: `${x.projectNumber} ${x.projectName}`,
            value: x.projectNumber,
            key: x.projectNumber,
          },
        ]
      : acc;
  }, []);
}

function mapWorkTaskType(workTasks: WorkTask[]): SelectOption[] {
  return workTasks.reduce<SelectOption[]>((acc, x) => {
    const notInCollection = !!!acc.find((y) => y.value === x.type);
    return notInCollection && x.type
      ? [
          ...acc,
          {
            text: x.type,
            value: x.type,
            key: x.type,
          },
        ]
      : acc;
  }, []);
}

function mapWorkTaskStatus(workTasks: WorkTask[]): SelectOption[] {
  return workTasks.reduce<SelectOption[]>((acc, x) => {
    const notInCollection = !!!acc.find((y) => y.value === x.status);
    return notInCollection && x.status
      ? [
          ...acc,
          {
            text: x.status,
            value: x.status,
            key: x.status,
          },
        ]
      : acc;
  }, []);
}

interface State {
  workTasks: WorkTask[];
  projectNumberFilter: string;
  workTaskTypeFilter: string;
  workTaskStatusFilter: string;
}

type Action =
  | { type: "setWorkTasks"; workTasks: WorkTask[] }
  | { type: "setProjectNumberFilter"; projectNumber: string }
  | { type: "setWorkTaskTypeFilter"; workTaskType: string }
  | { type: "setWorkTaskStatusFilter"; workTaskStatus: string };

const initialState: State = {
  workTasks: [],
  projectNumberFilter: "ALL",
  workTaskTypeFilter: "ALL",
  workTaskStatusFilter: "ALL",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setWorkTasks":
      return { ...initialState, workTasks: action.workTasks };
    case "setProjectNumberFilter":
      return { ...state, projectNumberFilter: action.projectNumber };
    case "setWorkTaskTypeFilter":
      return { ...state, workTaskTypeFilter: action.workTaskType };
    case "setWorkTaskStatusFilter":
      return { ...state, workTaskStatusFilter: action.workTaskStatus };
    default:
      throw new Error(`No action found.`);
  }
}

function WorkTasks() {
  const { t } = useTranslation();
  const client = useClient();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: "setWorkTasks", workTasks: getWorksTasks(client) });
  }, [client, dispatch]);

  const projectSelectOptions = useMemo(() => {
    const defaultOptions: SelectOption[] = [
      { text: t("ALL"), value: "ALL", key: "ALL" },
      {
        text: t("NO_ASSOCIATED_PROJECT"),
        value: "NO_ASSOCIATED_PROJECT",
        key: "NO_ASSOCIATED_PROJECT",
      },
    ];
    return state.workTasks
      ? [
          ...defaultOptions,
          ...mapProjectSelectOptions(state.workTasks).sort((x, y) =>
            x.text > y.text ? 1 : -1
          ),
        ]
      : [];
  }, [state.workTasks, t]);

  const typeSelectOptions = useMemo(() => {
    const defaultOptions: SelectOption[] = [
      { text: t("ALL"), value: "ALL", key: "ALL" },
    ];
    return state.workTasks
      ? [
          ...defaultOptions,
          ...mapWorkTaskType(state.workTasks).sort((x, y) =>
            x.text > y.text ? 1 : -1
          ),
        ]
      : [];
  }, [state.workTasks, t]);

  const statusSelectOptions = useMemo(() => {
    const defaultOptions: SelectOption[] = [
      { text: t("ALL"), value: "ALL", key: "ALL" },
    ];
    return state.workTasks
      ? [
          ...defaultOptions,
          ...mapWorkTaskStatus(state.workTasks).sort((x, y) =>
            x.text > y.text ? 1 : -1
          ),
        ]
      : [];
  }, [state.workTasks, t]);

  return (
    <div className="work-tasks">
      <div className="full-row full-row gap-default">
        <LabelContainer text={t("PROJECT")}>
          <SelectMenu
            options={projectSelectOptions}
            onSelected={(x) =>
              dispatch({
                type: "setProjectNumberFilter",
                projectNumber: x as string,
              })
            }
            selected={state.projectNumberFilter ?? ""}
            enableSearch={true}
          />
        </LabelContainer>
        <LabelContainer text={t("WORK_TASK_TYPE")}>
          <SelectMenu
            options={typeSelectOptions}
            onSelected={(x) =>
              dispatch({
                type: "setWorkTaskTypeFilter",
                workTaskType: x as string,
              })
            }
            selected={state.workTaskTypeFilter}
            enableSearch={true}
          />
        </LabelContainer>
        <LabelContainer text={t("WORK_TASK_STATUS")}>
          <SelectMenu
            options={statusSelectOptions}
            onSelected={(x) =>
              dispatch({
                type: "setWorkTaskStatusFilter",
                workTaskStatus: x as string,
              })
            }
            selected={state.workTaskStatusFilter}
            enableSearch={true}
          />
        </LabelContainer>
      </div>
      <div className="full-row">
        <SelectListView
          headerItems={[
            t("PROJECT_NUMBER"),
            t("PROJECT_NAME"),
            t("WORK_TASK_NUMBER"),
            t("WORK_TASK_TYPE"),
            t("WORK_TASK_STATUS"),
            t("WORK_TASK_NAME"),
            t("SUBTASK"),
            t("OWNER"),
            t("CREATED_DATE"),
            t("INSTALLATION_NUMBER"),
            t("MODIFIED_BY"),
          ]}
          bodyItems={[]}
          selectItem={() => {}}
          selected={""}
        />
      </div>
      <div className="full-row gap-default">
        <DefaultButton innerText={t("Pick work task")} onClick={() => {}} />
        <DefaultButton
          innerText={t("Pan/Zoom to address")}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

export default WorkTasks;
