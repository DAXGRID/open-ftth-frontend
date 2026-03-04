import { Client } from "urql";

export function getTagInfo(
  client: Client,
  terminalOrSpanSegmentIds: string[],
  equipmentId: string,
) {
  return client
    .query<TagsResponse>(TAGS_QUERY, {
      equipmentId: equipmentId,
      terminalOrSpanSegmentIds: terminalOrSpanSegmentIds,
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
query ($equipmentId: ID! $terminalOrSpanSegmentIds: [ID!]!) {
  utilityNetwork {
    tags (equipmentId: $equipmentId, terminalOrSpanSegmentIds: $terminalOrSpanSegmentIds) {
      terminalOrSpanId
      displayName
      tags
      comment
    }
  }
}
`;

interface UpdateTagsParams {
  terminalOrSpanSegmentIds: string;
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
mutation ($equipmentId: ID! $tags: [EquipmentTag]!) {
  terminalEquipment {
    updateTags (terminalOrSpanEquipmentIds: $terminalOrSpanEquipmentIds, tags: $tags) {
      isSuccess
      errorCode
      errorMessage
    }
  }
}
`;
