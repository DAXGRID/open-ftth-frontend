import React from "react";
import { useSubscription } from "urql";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("Welcome to React")}</h1>
      <Messages />
    </div>
  );
}

export default IndexPage;
