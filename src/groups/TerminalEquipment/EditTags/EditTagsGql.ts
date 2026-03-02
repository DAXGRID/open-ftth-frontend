import { Client } from "urql";

export function getTagInfo(
  client: Client,
  terminalOrSpanEquipmentIds: string[],
) {
  return client
    .query<TagsResponse>(TAGS_QUERY, {
      terminalOrSpanEquipmentIds: terminalOrSpanEquipmentIds,
    })
    .toPromise();
}

export function updateTags(client: Client, updateTags: UpdateTagsParams) {
  return client
    .mutation<UpdateTagsResponse>(UPDATE_TAGS_MUTATION, updateTags)
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
query ($terminalOrSpanEquipmentIds: [ID!]!) {
  utilityNetwork {
    tags (terminalOrSpanEquipmentIds: $terminalOrSpanEquipmentIds) {
      terminalOrSpanId
      displayName
      tags
      comment
    }
  }
}
`;

interface UpdateTagsParams {
  terminalOrSpanEquipmentId: string;
  tags: {
    terminalOrSpanId: string;
    displayName: string;
    comment?: string;
    tags?: string[];
  }[];
}

interface UpdateTagsResponse {
  terminalEquipment: {
    updateTags: {
      isSuccess: boolean;
      errorCode: string;
      errorMessage: string;
    };
  };
}

const UPDATE_TAGS_MUTATION = `
mutation ($terminalOrSpanEquipmentId: ID! $tags: [EquipmentTag]!) {
  terminalEquipment {
    updateTags (terminalOrSpanEquipmentId: $terminalOrSpanEquipmentId, tags: $tags) {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;
