import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const apolloClient = new ApolloClient({
  uri: "http://10.104.239.221/graphql",
  cache: new InMemoryCache(),
});

export default apolloClient;
