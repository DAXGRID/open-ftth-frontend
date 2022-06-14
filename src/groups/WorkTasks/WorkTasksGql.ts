import { Client } from "urql";

const exampleWorkTasks: WorkTask[] = [
  {
    projectNumber: "P12345",
    projectName: "Andeby",
    number: "W000001",
    type: "Gadeskab",
    status: "Oprettet",
    name: "Nyt skabsomraade i odder nybolig vej",
    subtask: null,
    owner: "Hans",
    createdDate: "01-06-2021",
    installationNumber: null,
    modifiedBy: null,
    geometry: null,
  },
  {
    projectNumber: "P12345",
    projectName: "Andeby",
    number: "W000002",
    type: "Gadeskab",
    status: "Fuldfoert",
    name: "Nyt skabsomraade syd",
    subtask: "Etape 1",
    owner: "Hans",
    createdDate: "01-06-2021",
    installationNumber: null,
    modifiedBy: null,
    geometry: null,
  },
  {
    projectNumber: "P12345",
    projectName: "Andeby",
    number: "W000003",
    type: "Gadeskab",
    status: "Oprettet",
    name: "Nyt skabsomraade syd",
    subtask: "Etape 2",
    owner: "Hans",
    createdDate: "04-06-2021",
    installationNumber: null,
    modifiedBy: "Susie",
    geometry: null,
  },
  {
    projectNumber: "P22222234",
    projectName: "Boligby",
    number: "W000004",
    type: "Installation i foreninger",
    status: "Igangvaerende",
    name: "Bygning 12A",
    subtask: null,
    owner: "Bent",
    createdDate: "23-01-2022",
    installationNumber: null,
    modifiedBy: null,
    geometry: null,
  },
  {
    projectNumber: null,
    projectName: null,
    number: "W000010",
    type: "Eftertilmelding Auto",
    status: "Oprettet",
    name: null,
    subtask: null,
    owner: null,
    createdDate: "10-02-2022",
    installationNumber: "12345",
    modifiedBy: null,
    geometry: null,
  },
  {
    projectNumber: null,
    projectName: null,
    number: "W000011",
    type: "Eftertilmelding Manuel",
    status: "Oprettet",
    name: null,
    subtask: null,
    owner: null,
    createdDate: "10-02-2022",
    installationNumber: "23456",
    modifiedBy: "Jane",
    geometry: null,
  },
];

// TODO use client.
export function getWorksTasks(_: Client): WorkTask[] {
  return exampleWorkTasks;
}

export interface WorkTask {
  projectNumber: string | null;
  projectName: string | null;
  number: string;
  type: string;
  status: string;
  name: string | null;
  subtask: string | null;
  owner: string | null;
  createdDate: string;
  installationNumber: string | null;
  modifiedBy: string | null;
  geometry: {
    coordinates: string;
    type: string;
  } | null;
}

// export const SET_CURRENT_WORK_TASK_MUTATION = `mutation ($userName: String!, $workTaskId: ID!) {
//   userContext {
//     setCurrentWorkTask(userName: $userName, workTaskId: $workTaskId)
//     {
//       currentWorkTask {
//         __typename
//       }
//       userName
//     }
//   }
// }`;
