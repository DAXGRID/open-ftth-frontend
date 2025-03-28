import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import MultiLineTextBox from "../../../components/MultiLineTextbox";
import DefaultButton from "../../../components/DefaultButton";
import TagMenu from "../../../components/TagMenu";

interface TagInfo {
  id: string;
  name: string;
  comment?: string;
  tags: string[];
}

const fiberRackTagData: TagInfo[] = [
  {
    id: "a1b2c3d4-e5f6-4789-90ab-cdef01234567",
    name: "Data Center A - Rack 01",
    comment: "Main fiber distribution rack in Data Center A.",
    tags: ["DATA CENTER", "LOCATION A", "RACK 01", "FIBER DISTRIBUTION"],
  },
  {
    id: "f8e7d6c5-b4a3-4210-8fed-cba987654321",
    name: "Building B - Floor 2 West Side",
    comment:
      "Intermediate fiber patch panel rack on the west side of the second floor in Building B.",
    tags: ["BUILDING B", "FLOOR 2", "WEST", "FIBER PATCH PANEL"],
  },
  {
    id: "11223344-5566-4778-8990-aabbccddeeff",
    name: "Main Distribution Frame (MDF)",
    comment: "Central MDF for the entire network infrastructure.",
    tags: ["MDF", "MAIN DISTRIBUTION", "CENTRAL", "CORE NETWORK"],
  },
  {
    id: "fedcba98-7654-4321-0fed-cba987654320",
    name: "Server Room 3 - Equipment Rack",
    comment: "Rack containing fiber termination for servers in Server Room 3.",
    tags: ["SERVER ROOM 3", "EQUIPMENT RACK", "FIBER TERMINATION", "SERVERS"],
  },
  {
    id: "99887766-5544-4332-2110-aabbccdd00ff",
    name: "Building C - South Wing Interconnect",
    comment:
      "Rack facilitating fiber connections between different parts of the south wing in Building C.",
    tags: ["BUILDING C", "SOUTH WING", "INTERCONNECT", "FIBER BACKBONE"],
  },
  {
    id: "00112233-4455-4667-8899-aabbccddeeff",
    name: "Telecom Closet 1 - Zone A",
    comment:
      "Fiber termination point for users in Zone A connected to Telecom Closet 1.",
    tags: ["TELECOM CLOSET", "ZONE A", "USER CONNECTIVITY", "FIBER ACCESS"],
  },
  {
    id: "aabbccdd-eeff-4012-3456-7890abcdef0123",
    name: "Outdoor Fiber Enclosure #5",
    comment:
      "Weatherproof enclosure containing fiber splices and connections in the outdoor network.",
    tags: ["OUTDOOR", "ENCLOSURE", "FIBER SPLICE", "WEATHERPROOF"],
  },
];

const availableTags = [...new Set(fiberRackTagData.flatMap((x) => x.tags))].map(
  (x) => ({ text: x.toLowerCase(), value: x }),
);

function createTagOptions(
  selectedTags: Set<string>,
  allTags: { text: string; value: string }[],
) {
  return allTags.map((x) => {
    return {
      text: x.text,
      value: x.value,
      checked: selectedTags.has(x.value),
    };
  });
}

function EditTags() {
  const { t } = useTranslation();

  const [tags, setTags] = useState<Record<string, TagInfo> | null>(null);

  useEffect(() => {
    const tagInfoLookUp = fiberRackTagData.reduce<Record<string, TagInfo>>(
      (acc, x) => {
        acc[x.id] = x;
        return acc;
      },
      {},
    );
    setTags(tagInfoLookUp);
  }, []);

  const updateTagComment = useCallback(
    (id: string, comment: string) => {
      setTags((prevTags) => {
        if (prevTags === null) {
          return prevTags;
        }

        const updatedTags = { ...prevTags };
        const tagToUpdate = updatedTags[id];
        if (tagToUpdate) {
          updatedTags[id] = {
            ...tagToUpdate,
            comment,
          };
        }

        return updatedTags;
      });
    },
    [setTags],
  );

  const tagUpdated = useCallback(
    (id: string, tagValue: string, checked: boolean) => {
      setTags((prevTags) => {
        const updatedTags = { ...prevTags };

        const tag = updatedTags[id];

        tag.tags = checked
          ? [...tag.tags, tagValue]
          : [...tag.tags.filter((x) => x !== tagValue)];

        return updatedTags;
      });
    },
    [setTags],
  );

  if (tags === null) {
    return <></>;
  }

  return (
    <div className="tag-view">
      <div className="full-row">
        <div className="edit-tags-container">
          <div className="edit-tags-container-header">
            <div className="edit-tags-container-header-item">{t("NAME")}</div>
            <div className="edit-tags-container-header-item">
              {t("COMMENT")}
            </div>
            <div className="edit-tags-container-header-item">{t("TAGS")}</div>
          </div>
          <div className="edit-tags-container-body">
            <div className="edit-tags-editor-container-body-line"></div>
            {Object.values(tags).map((x) => (
              <div className="edit-tags-container-body-line" key={x.id}>
                <div className="edit-tags-container-body-line-item">
                  {x.name}
                </div>
                <div className="edit-tags-container-body-line-item">
                  <MultiLineTextBox
                    rows={5}
                    value={x.comment ?? ""}
                    setValue={(updatedComment) =>
                      updateTagComment(x.id, updatedComment)
                    }
                  />
                </div>
                <div className="edit-tags-container-body-line-item">
                  <TagMenu
                    tagUpdated={(value, checked) =>
                      tagUpdated(x.id, value, checked)
                    }
                    tags={createTagOptions(new Set(x.tags), availableTags)}
                    showMenu={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="full-row center-items">
        <DefaultButton
          onClick={() => {}}
          innerText={t("UPDATE")}
          maxWidth={"400px"}
        />
      </div>
    </div>
  );
}

export default EditTags;
