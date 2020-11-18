import React, { useState, useEffect } from "react";
import { useQuery } from "urql";
import { useTranslation } from "react-i18next";
import SelectListView from "../../components/SelectListView";
import DefaultButton from "../../components/DefaultButton";
import SelectMenu from "../../components/SelectMenu";
import { workOrders } from "../../qgl/workOrders";

function WorkTaskPage() {
  const { t } = useTranslation();
  const [workTasks, setWorkTasks] = useState([]);
  const [selectProject, setSelectProject] = useState();
  const [selectedProject, setSelectedProject] = useState({ value: "" });
  const [result] = useQuery({ query: workOrders });
  const { fetching, error } = result;

  useEffect(() => {
    if (fetching) return;

    const { data } = result;
    const projects = data.workService.projectsAndWorkTasks;

    const newWorkTasks = [];
    const newSelectProjects = [];

    projects.forEach((p) => {
      var selectProjectItem = {
        text: "",
        value: 0,
        selected: false,
      };

      selectProjectItem.text = p.name;
      selectProjectItem.value = p.mRID;

      newSelectProjects.push(selectProjectItem);

      p.workTasks.forEach((w) => {
        const selectListItem = {
          rows: [],
          id: 0,
          selected: false,
          collectionId: 0,
        };

        selectListItem.rows.push(w.name);
        selectListItem.rows.push(w.centralOfficeArea);
        selectListItem.rows.push(w.flexPointArea);
        selectListItem.rows.push(w.splicePointArea);
        selectListItem.rows.push(w.technology);
        selectListItem.rows.push(w.workTaskType);
        selectListItem.rows.push(w.addressString);
        selectListItem.rows.push(w.status);
        selectListItem.id = w.mRID;
        selectListItem.collectionId = p.mRID;

        newWorkTasks.push(selectListItem);
      });
    });

    newSelectProjects[0].selected = true;
    setSelectProject(newSelectProjects);
    setWorkTasks(newWorkTasks);
  }, [result]);

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;

  const selectItem = (selectedItem) => {
    workTasks.forEach((x) => (x.selected = false));
    selectedItem.selected = true;
    setWorkTasks([...workTasks]);
  };

  const pickWorkTask = () => {
    console.log("Pick work task");
  };

  const panToAddress = () => {
    console.log("Pan to address");
  };

  const onSelected = (selected) => {
    if (!selected) return;

    setSelectedProject(selected);
  };

  return (
    <div>
      <div className="full-row">
        <SelectMenu
          maxWidth="400px"
          options={selectProject}
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
            (x) => x.collectionId === selectedProject.value
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
          onClick={panToAddress}
        />
      </div>
    </div>
  );
}

export default WorkTaskPage;
