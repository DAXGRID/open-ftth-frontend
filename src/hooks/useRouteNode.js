import { gql, useQuery } from "@apollo/client";

const GET_ROUTE_FEATURES = gql`
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

export default (nodeId) => {
  return useQuery(GET_ROUTE_FEATURES, {
    variables: {
      nodeId,
    },
  });
};
