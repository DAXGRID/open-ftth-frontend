import { useTranslation } from "react-i18next";
import LabelContainer from "../../components/LabelContainer";
import SelectMenu from "../../components/SelectMenu";
import DefaultButton from "../../components/DefaultButton";
import SelectListView from "../../components/SelectListView";

function WorkTasks() {
  const { t } = useTranslation();

  return (
    <div className="work-tasks">
      <div className="full-row full-row gap-default">
        <LabelContainer text={t("PROJECT")}>
          <SelectMenu
            options={[]}
            removePlaceHolderOnSelect
            onSelected={(x) => {}}
            selected={""}
            enableSearch={true}
          />
        </LabelContainer>
        <LabelContainer text={t("WORK_TASK_TYPE")}>
          <SelectMenu
            options={[]}
            removePlaceHolderOnSelect
            onSelected={(x) => {}}
            selected={""}
            enableSearch={true}
          />
        </LabelContainer>
        <LabelContainer text={t("WORK_TASK_STATUS")}>
          <SelectMenu
            options={[]}
            removePlaceHolderOnSelect
            onSelected={(x) => {}}
            selected={""}
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
