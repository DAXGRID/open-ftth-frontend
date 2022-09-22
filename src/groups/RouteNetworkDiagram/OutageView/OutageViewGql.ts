import { Client } from "urql";

export interface Node {
  id: string;
  label: string;
  value: string | null;
  nodes: Node[] | null;
  description: string | null;
}

const nodes: Node = {
  id: "69b93498-3c08-432b-80e7-830b99913f0c",
  label: "Trace",
  value: null,
  description: "Description 1",
  nodes: [
    {
      id: "223c956c-d559-418d-8cf2-807c8a38f46c",
      label: "OSO 3X19",
      value: null,
      description: "Description 2",
      nodes: [
        {
          id: "5909262c-d9e1-44b0-8996-fdef35faea1c",
          label: "Subroer 1",
          value: null,
          description: "Description 3",
          nodes: [
            {
              id: "7375a806-b1fb-4aac-8d3f-0ea60a5b6b51",
              label: "Kabel",
              value: null,
              description: "Description 4",
              nodes: [
                {
                  id: "8c19036d-9299-4e5d-9a53-ff23891c6658",
                  label: "Fiber",
                  value: null,
                  description: "Description 5",
                  nodes: [
                    {
                      id: "1baf5c25-a611-4e19-b410-a35a7011e3bf",
                      label: "123",
                      value: "1baf5c25-a611-4e19-b410-a35a7011e3bf",
                      description: "Description 6",
                      nodes: null,
                    },
                    {
                      id: "b2713d17-1efe-4556-a145-538292d11f01",
                      label: "234",
                      value: "b2713d17-1efe-4556-a145-538292d11f01",
                      description: "Description 7",
                      nodes: null,
                    },
                    {
                      id: "1903cc5e-483f-473c-a7dc-8ecb93342fa5",
                      label: "345",
                      value: "1903cc5e-483f-473c-a7dc-8ecb93342fa5",
                      description: "Description 8",
                      nodes: null,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "831f5f43-1abe-454f-beae-9404ea33f083",
      label: "OSO 3X19",
      value: null,
      description: "Description 9",
      nodes: [
        {
          id: "fec9548c-68ce-424b-9863-5ee529b23fd7",
          label: "Subroer 1",
          value: null,
          description: "Description 10",
          nodes: [
            {
              id: "e8cf1e9d-6755-4cbc-8a26-815c232534b4",
              label: "Kabel",
              value: null,
              description: "Description 11",
              nodes: [
                {
                  id: "775842c0-b82a-4796-9d1b-ab4c4110e0cf",
                  label: "Fiber",
                  value: null,
                  description: "Description 12",
                  nodes: [
                    {
                      id: "5e8b92f6-05f5-4238-ab75-d3ddb2059b53",
                      label: "123",
                      value: "5e8b92f6-05f5-4238-ab75-d3ddb2059b53",
                      description: "Description 13",
                      nodes: null,
                    },
                    {
                      id: "b398e8a9-8b26-4488-ba3d-c8ea7caa4d2d",
                      label: "234",
                      value: "b398e8a9-8b26-4488-ba3d-c8ea7caa4d2d",
                      description: "Description 14",
                      nodes: null,
                    },
                    {
                      id: "70681eca-3eb4-4c7b-baed-2e7005c54e27",
                      label: "345",
                      value: "70681eca-3eb4-4c7b-baed-2e7005c54e27",
                      description: "Description 15",
                      nodes: null,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export function getInformation(client: Client) {
  return nodes;
}

export function getWorkTasks(client: Client): WorkTask[] {
  return [];
}

export interface WorkTask {
  workTaskId: string;
  number: string;
  type: string;
}
