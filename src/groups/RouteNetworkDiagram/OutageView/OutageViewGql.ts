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

export function sendTroubleTicket(client: Client, params: SendTroubleTicketParams) {
  return client
    .mutation<SendTroubleTicketResponse>(SEND_TROUBLE_TICKET_MUTATION, params)
    .toPromise();
}

export interface Node {
  id: string;
  label: string;
  value: string | null;
  nodes: Node[] | null;
  description: string | null;
  expanded: boolean | null;
}

interface OutageViewQueryResponse {
  outage: {
    outageView: Node;
  };
}

export const OUTAGE_VIEW_QUERY = `
query (
  $routeNetworkElementId: ID!
) {
  outage {
    outageView(routeNetworkElementId: $routeNetworkElementId) {
      id
      label
      description
      value
      expanded
      nodes {
        id
        label
        description
        value
        expanded
        nodes {
          id
          label
          description
          value
          expanded
          nodes {
            id
            label
            description
            value
            expanded
            nodes {
              id
              label
              description
              value
              expanded
              nodes {
                id
                label
                description
                value
                expanded
                nodes {
                  id
                  label
                  description
                  value
                  expanded
                  nodes {
                    id
                    label
                    description
                    value
                    expanded
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
  name: string;
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

interface SendTroubleTicketResponse {
  outage: {
    sendTroubleTicket: {
      errorCode?: string;
      isSuccess: boolean;
      errorMesssage?: string;
    }
  }
}

interface SendTroubleTicketParams {
  workTaskId: string;
  installationsIds: string[];
}

const SEND_TROUBLE_TICKET_MUTATION = `
mutation(
  $workTaskId: ID!,
  $installationsIds: [String]!
) {
  outage {
    sendTroubleTicket(
      workTaskId: $workTaskId
      installationsIds: $installationsIds
    ) {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;
