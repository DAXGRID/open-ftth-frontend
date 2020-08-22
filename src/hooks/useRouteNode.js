import { gql, useQuery } from "@apollo/client";

const GET_ROUTE_NODE = gql`
  query($nodeId: ID!) {
    routeNetwork {
      routeNode(id: $nodeId) {
        routeNodeId
        namingInfo {
          name
          description
        }
      }
    }
  }
`;

const useRouteNode = (nodeId) => {
  return useQuery(GET_ROUTE_NODE, {
    variables: {
      nodeId,
    },
  });
};

export default useRouteNode;
