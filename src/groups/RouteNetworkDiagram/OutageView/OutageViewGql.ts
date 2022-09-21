import { Client } from "urql";

export interface Node {
  id: string;
  label: string;
  value: string | null;
  nodes: Node[] | null;
}

const nodes: Node = {
  id: "69b93498-3c08-432b-80e7-830b99913f0c",
  label: "Trace",
  value: null,
  nodes: [
    {
      id: "223c956c-d559-418d-8cf2-807c8a38f46c",
      label: "OSO 3X19",
      value: null,
      nodes: [
        {
          id: "5909262c-d9e1-44b0-8996-fdef35faea1c",
          label: "Subror 1",
          value: null,
          nodes: [
            {
              id: "7375a806-b1fb-4aac-8d3f-0ea60a5b6b51",
              label: "Kabel",
              value: null,
              nodes: [
                {
                  id: "8c19036d-9299-4e5d-9a53-ff23891c6658",
                  label: "Fiber",
                  value: null,
                  nodes: [
                    {
                      id: "f86576a4-5458-4208-bdcf-edeedcee670e",
                      label: "123",
                      value: null,
                      nodes: null,
                    },
                    {
                      id: "f86576a4-5458-4208-bdcf-edeedcee670e",
                      label: "234",
                      value: null,
                      nodes: null,
                    },
                    {
                      id: "f86576a4-5458-4208-bdcf-edeedcee670e",
                      label: "345",
                      value: null,
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
      id: "223c956c-d559-418d-8cf2-807c8a38f46c",
      label: "OSO 3X19",
      value: null,
      nodes: [
        {
          id: "5909262c-d9e1-44b0-8996-fdef35faea1c",
          label: "Subror 1",
          value: null,
          nodes: [
            {
              id: "7375a806-b1fb-4aac-8d3f-0ea60a5b6b51",
              label: "Kabel",
              value: null,
              nodes: [
                {
                  id: "8c19036d-9299-4e5d-9a53-ff23891c6658",
                  label: "Fiber",
                  value: null,
                  nodes: [
                    {
                      id: "f86576a4-5458-4208-bdcf-edeedcee670e",
                      label: "123",
                      value: null,
                      nodes: null,
                    },
                    {
                      id: "f86576a4-5458-4208-bdcf-edeedcee670e",
                      label: "234",
                      value: null,
                      nodes: null,
                    },
                    {
                      id: "f86576a4-5458-4208-bdcf-edeedcee670e",
                      label: "345",
                      value: null,
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
      id: "223c956c-d559-418d-8cf2-807c8a38f46c",
      label: "OSO 3X19",
      value: null,
      nodes: [
        {
          id: "5909262c-d9e1-44b0-8996-fdef35faea1c",
          label: "Subror 1",
          value: null,
          nodes: [
            {
              id: "7375a806-b1fb-4aac-8d3f-0ea60a5b6b51",
              label: "Kabel",
              value: null,
              nodes: [
                {
                  id: "8c19036d-9299-4e5d-9a53-ff23891c6658",
                  label: "Fiber",
                  value: null,
                  nodes: [
                    {
                      id: "f86576a4-5458-4208-bdcf-edeedcee670e",
                      label: "123",
                      value: null,
                      nodes: null,
                    },
                    {
                      id: "f86576a4-5458-4208-bdcf-edeedcee670e",
                      label: "234",
                      value: null,
                      nodes: null,
                    },
                    {
                      id: "f86576a4-5458-4208-bdcf-edeedcee670e",
                      label: "345",
                      value: null,
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
