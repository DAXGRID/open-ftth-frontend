import React from "react";
import NamingInfo from "../components/NamingInfo";
import FormSection from "../components/FormSection";
import { gql, useSubscription } from "@apollo/client";

const SUBSCRIBE_GEOGRAPHICAL_AREA_UPDATED_EVENTS = gql`
  subscription {
    geographicalAreaUpdatedEvents {
      _id: eventId
      __typename
    }
  }
`;

function IndexPage() {
  const { data, loading } = useSubscription(
    SUBSCRIBE_GEOGRAPHICAL_AREA_UPDATED_EVENTS,
    {
      fetchPolicy: "no-cache",
      onSubscriptionData: write,
    }
  );

  function write(message) {
    if (window.printer) {
      window.printer.text(JSON.stringify(message.subscriptionData.data));
    }
  }

  return (
    <div>
      <FormSection>
        <NamingInfo />
      </FormSection>
      <p>
        {!loading && data.geographicalAreaUpdatedEvents.eventSequenceNumber}
      </p>
    </div>
  );
}

export default IndexPage;
