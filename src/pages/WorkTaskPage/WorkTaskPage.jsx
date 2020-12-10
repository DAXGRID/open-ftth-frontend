import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'urql';
import { useTranslation } from 'react-i18next';
import SelectListView from '../../components/SelectListView';
import DefaultButton from '../../components/DefaultButton';
import SelectMenu from '../../components/SelectMenu';
import Notification from '../../components/Notification';
import { ProjectsAndWorkTasks, SetCurrentWorkTask } from '../../qgl/WorkOrders';
import useBridgeConnector from '../../bridge/useBridgeConnector';

function WorkTaskPage() {
  const { t } = useTranslation();
  const [workTasks, setWorkTasks] = useState([]);
  const [selectProject, setSelectProject] = useState();
  const [selectedProject, setSelectedProject] = useState({ value: '' });
  const [validation, setValidation] = useState({});
  const [currentWorkTaskResult, setCurrentWorkTask] = useMutation(
    SetCurrentWorkTask,
  );

  const [result] = useQuery({ query: ProjectsAndWorkTasks });
  const { fetching, error } = result;
  const { panToCoordinate } = useBridgeConnector();

  useEffect(() => {
    if (fetching) return;

    const { data } = result;
    const projects = data.workService.projectsAndWorkTasks;

    const newWorkTasks = [];
    const newSelectProjects = [];

    projects.forEach((p) => {
      const selectProjectItem = {
        text: '',
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
          data: w,
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
  if (error) {
    return (
      <p>
        Oh no...
        {error.message}
      </p>
    );
  }

  const selectItem = (selectedItem) => {
    workTasks.forEach((x) => (x.selected = false));
    selectedItem.selected = true;
    setWorkTasks([...workTasks]);
  };

  const pickWorkTask = () => {
    const selectedWorkTask = workTasks.find((x) => x.selected);

    if (!selectedWorkTask) {
      setValidation({
        type: 'error',
        headerText: t('Error'),
        bodyText: t('Please select a work task'),
      });

      return;
    }

    const variables = {
      userName: 'user',
      workTaskId: selectedWorkTask.id,
    };
    setCurrentWorkTask(variables).then((r) => {
      setValidation({
        type: 'success',
        headerText: t('Success'),
        bodyText:
          `${t('Work task is now added to user')
          }: ${r.data.userContext.setCurrentWorkTask.userName}`,
      });
    });
  };

  const panToAddress = () => {
    const selectedWorkTask = workTasks.find((x) => x.selected);

    if (!selectedWorkTask.data.geometry) {
      setValidation({
        type: 'error',
        headerText: t('Error'),
        bodyText: t('The work task has no coordinates'),
      });
    }

    const coordinate = selectedWorkTask.data.geometry.coordinates;
    panToCoordinate(coordinate);
  };

  const onSelected = (selected) => {
    if (!selected) return;

    setSelectedProject(selected);
  };

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
          options={selectProject}
          onSelected={onSelected}
        />
      </div>
      <div className="full-row">
        <SelectListView
          headerItems={[
            t('Name'),
            t('Central office area'),
            t('Flex point area'),
            t('Splice point area'),
            t('Technology'),
            t('Work task type'),
            t('Address'),
            t('Status'),
          ]}
          bodyItems={workTasks.filter(
            (x) => x.collectionId === selectedProject.value,
          )}
          selectItem={selectItem}
        />
      </div>

      <div className="full-row">
        <DefaultButton
          maxWidth="400px"
          innerText={t('Pick work task')}
          onClick={pickWorkTask}
        />
        <DefaultButton
          maxWidth="400px"
          innerText={t('Pan/Zoom to address')}
          onClick={panToAddress}
        />
      </div>
    </div>
  );
}

export default WorkTaskPage;
