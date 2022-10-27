import { Client } from "urql";

export function getInformation(client: Client, routeNetworkElementId: string) {
  return client
    .query<OutageViewQueryResponse>(OUTAGE_VIEW_QUERY, {
      routeNetworkElementId: routeNetworkElementId,
    })
    .toPromise();
}

export function getWorkTasks(client: Client): WorkTask[] {
  return [];
}

export interface Node {
  id: string;
  label: string;
  value: string | null;
  nodes: Node[] | null;
  description: string | null;
}

interface OutageViewQueryResponse {
  outage: {
    outageView: Node;
  };
}

export const OUTAGE_VIEW_QUERY = `
query (
$routeNetworkElementId: ID!) {
  outage {
    outageView(routeNetworkElementId: $routeNetworkElementId) {
      id
      label
      description
      value
      nodes {
        id
        label
        description
        value
        nodes {
          id
          label
          description
          value
          nodes {
            id
            label
            description
            value
            nodes {
              id
              label
              description
              value
              nodes {
                id
                label
                description
                value
                nodes {
                  id
                  label
                  description
                  value
                  nodes {
                    id
                    label
                    description
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

export interface WorkTask {
  workTaskId: string;
  number: string;
  type: string;
}
