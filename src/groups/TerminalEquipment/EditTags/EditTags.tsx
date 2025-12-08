import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "urql";
import MultiLineTextBox from "../../../components/MultiLineTextbox";
import DefaultButton from "../../../components/DefaultButton";
import TagMenu from "../../../components/TagMenu";
import { getTagInfo, updateTags } from "./EditTagsGql";
import { toast } from "react-toastify";

interface TagInfo {
  terminalOrSpanId: string;
  displayName: string;
  comment?: string;
  tags?: string[];
}

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

interface EditTagsProps {
  terminalOrSpanEquipmentId: string;
}

const availableTags = [
  "Broken",
  "Extremely broken",
  "Could not be more broken than this",
].map((x) => ({
  text: x,
  value: x,
}));

function EditTags({ terminalOrSpanEquipmentId }: EditTagsProps) {
  const { t } = useTranslation();
  const client = useClient();

  const [tags, setTags] = useState<Record<string, TagInfo> | null>(null);

  useEffect(() => {
    if (!terminalOrSpanEquipmentId || !client) return;

    getTagInfo(client, terminalOrSpanEquipmentId)
      .then((res) => {
        const tagInfoLookUp = res.data?.utilityNetwork.tags.reduce<
          Record<string, TagInfo>
        >((acc, x) => {
          acc[x.terminalOrSpanId] = x;
          return acc;
        }, {});

        setTags(tagInfoLookUp);
      })
      .catch((err) => {
        toast.error(t("ERROR"));
        console.error(err);
      });
  }, [client, terminalOrSpanEquipmentId]);

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

        if (!tag.tags) {
          tag.tags = [];
        }

        if (checked) {
          tag.tags = [...new Set([...tag.tags, tagValue])];
        } else {
          tag.tags = [...tag.tags.filter((x) => x !== tagValue)];
        }

        return updatedTags;
      });
    },
    [setTags],
  );

  const commitUpdateTags = () => {
    const tagsToUpdate = Object.entries(tags)
      .map((x) => x[1])
      .map((x) => ({
        terminalOrSpanId: x.terminalOrSpanId,
        comment: x.comment,
        tags: x.tags,
      }))
      .filter((x) => x.comment || (x.tags && x.tags.length > 0));

    console.log(tagsToUpdate);

    updateTags(client, {
      terminalOrSpanEquipmentId: terminalOrSpanEquipmentId,
      tags: tagsToUpdate,
    })
      .then((res) => {
        const body = res.data?.terminalEquipment.updateTags;
        if (body?.isSuccess) {
          toast.success(t("UPDATED"));
        } else {
          toast.error(t(body?.errorCode ?? "ERROR"));
        }
      })
      .catch((err) => {
        toast.error(t("ERROR"));
        console.error(err);
      });
  };

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
              <div
                className="edit-tags-container-body-line"
                key={x.terminalOrSpanId}
              >
                <div className="edit-tags-container-body-line-item">
                  {x.displayName}
                </div>
                <div className="edit-tags-container-body-line-item">
                  <MultiLineTextBox
                    rows={5}
                    value={x.comment ?? ""}
                    setValue={(updatedComment) =>
                      updateTagComment(x.terminalOrSpanId, updatedComment)
                    }
                  />
                </div>
                <div className="edit-tags-container-body-line-item">
                  <TagMenu
                    tagUpdated={(value, checked) =>
                      tagUpdated(x.terminalOrSpanId, value, checked)
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
          onClick={commitUpdateTags}
          innerText={t("UPDATE")}
          maxWidth={"400px"}
        />
      </div>
    </div>
  );
}

export default EditTags;
