import React from "react";
import { useSubscription } from "urql";

const SUBSCRIBE_GEOGRAPHICAL_AREA_UPDATED_EVENTS = `
  subscription GeographicalAreaUpdatedSub{
    geographicalAreaUpdatedEvents {
      _id: eventId
      __typename
      eventId
    }
  }
`;

const handleSubscription = (geographicalAreaUpdates = [], response) => {
  return [response.geographicalAreaUpdatedEvents, ...geographicalAreaUpdates];
};

const Messages = () => {
  const [res] = useSubscription(
    { query: SUBSCRIBE_GEOGRAPHICAL_AREA_UPDATED_EVENTS },
    handleSubscription
  );

  if (!res.data) {
    return <p>No new messages</p>;
  }

  return (
    <ul>
      {res.data.map((geographicalAreaUpdate) => (
        <p key={geographicalAreaUpdate.eventId}>
          {geographicalAreaUpdate.eventId}
        </p>
      ))}
    </ul>
  );
};

function IndexPage() {
  return (
    <div>
      <h1>Index Page</h1>
      <Messages />
    </div>
  );
}

export default IndexPage;
