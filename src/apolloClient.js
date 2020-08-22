import { ApolloClient, InMemoryCache } from "@apollo/client";

const apolloClient = new ApolloClient({
  uri: "http://10.109.87.197/graphql",
  cache: new InMemoryCache(),
});

export default apolloClient;
