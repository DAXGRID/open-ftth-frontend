import { Client } from "urql";

export const lookupLocation = (
  client: Client,
  kind: string,
  value: string
) => {
  return client
    .query<LookupLocationResponse>(LOOKUP_LOCATION_QUERY, {
      kind: kind,
      value: value,
    } as LookupLocationParams)
    .toPromise();
};

interface LookupLocationParams {
  kind: string;
  value: string;
}

export interface LookupLocationResponse {
  location: {
    lookupLocation: {
      routeElementId: string;
      envelope: {
        maxX: number;
        maxY: number;
        minX: number;
        minY: number;
      };
      coordinate: {
        x: number;
        y: number;
      };
    };
  };
}


const LOOKUP_LOCATION_QUERY = `
query ($kind: String!, $value: String!) {
  location {
    lookupLocation(kind: $kind value: $value) {
      routeElementId
      envelope {
        maxX
        maxY
        minX
        minY
      }
      coordinate {
        x
        y
      }
    }
  }
}`;
