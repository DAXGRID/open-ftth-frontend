import { Client } from "urql";

export function shortestPathBetweenSegments(
  client: Client,
  fromSegmentId: string,
  toSegmentId: string,
): ShortestPathBetweenNodesResponse {
  return client
    .query<ShortestPathBetweenNodesResponse>(SHORTEST_PATH_BETWEEN_NODE_QUERY, {
      fromSegmentId,
      toSegmentId,
    } as ConnectivityFaceConnectionsParams)
    .toPromise();
}

type ShortestPathBetweenNodesResponse = {
  routeNetwork: {
    shortestPathBetweenSegments: string[];
  };
};

const SHORTEST_PATH_BETWEEN_NODE_QUERY = `
query($fromSegmentId: ID!, $toSegmentId: ID!) {
  routeNetwork {
    shortestPathBetweenSegments(
      fromSegmentId: $fromSegmentId
      toSegmentId: $toSegmentId)
  }
}`;
