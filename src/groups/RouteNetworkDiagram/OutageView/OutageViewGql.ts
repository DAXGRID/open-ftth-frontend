import { Client } from "urql";

export function getInformation(client: Client, routeNetworkElementId: string) {
  return client
    .query<OutageViewQueryResponse>(OUTAGE_VIEW_QUERY, {
      routeNetworkElementId: routeNetworkElementId,
    })
    .toPromise();
}

export function getWorkTasks(client: Client) {
  return client
    .query<LatestTenTroubleTicketsResponse>(LATEST_TEN_TROUBLE_TICKETS_ORDERED_BY_DATE_QUERY)
    .toPromise();
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

export interface LatestTenTroubleTicketsResponse {
  outage: {
    latestTenTroubleTicketsOrderedByDate: WorkTask[]
  }
}

export interface WorkTask {
  workTaskId: string;
  number: string;
  type: string;
}

const LATEST_TEN_TROUBLE_TICKETS_ORDERED_BY_DATE_QUERY = `
query {
  outage {
    latestTenTroubleTicketsOrderedByDate
    {
      workTaskId
      number
      name
    }
  }
}
`;
