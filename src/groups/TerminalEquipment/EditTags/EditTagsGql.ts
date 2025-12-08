import { Client } from "urql";

export function getTagInfo(client: Client, terminalOrSpanEquipmentId: string) {
  return client
    .query<TagsResponse>(TAGS_QUERY, {
      terminalOrSpanEquipmentId: terminalOrSpanEquipmentId,
    })
    .toPromise();
}

interface TagsResponse {
  utilityNetwork: {
    tags: {
      terminalOrSpanId: string;
      displayName: string;
      comment?: string;
      tags?: string[];
    }[];
  };
}

const TAGS_QUERY = `
query ($terminalOrSpanEquipmentId: ID!) {
  utilityNetwork {
    tags (terminalOrSpanEquipmentId: $terminalOrSpanEquipmentId) {
      terminalOrSpanId
      displayName
      tags
      comment
    }
  }
}
`;
