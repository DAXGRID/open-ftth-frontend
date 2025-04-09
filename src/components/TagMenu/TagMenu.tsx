import CheckBox from "../Checkbox";
import { useState } from "react";

interface Tag {
  text: string;
  value: string;
  checked: boolean;
}

interface TagMenuProps {
  tags: Tag[];
  showMenu: boolean;
  tagUpdated: (value: string, checked: boolean) => void;
}

function TagMenu({ tags, showMenu, tagUpdated }: TagMenuProps) {
  const [tagSelectMenuOpen, setTagSelectMenuOpen] = useState(false);

  return (
    <div className="tag-menu">
      {!tagSelectMenuOpen && (
        <>
          {tags
            .filter((tag) => tag.checked)
            .map(({ text, value }) => (
              <div className="tag-menu-line" key={value}>
                {text}{" "}
                <span
                  onClick={() => tagUpdated(value, false)}
                  className="tag-menu-line-remove"
                >
                  x
                </span>
              </div>
            ))}
          <div
            className="tag-menu-new-tag"
            onClick={() => setTagSelectMenuOpen((prevValue) => !prevValue)}
          >
            <span className="tag-menu-new-tag-add">+</span>
          </div>
        </>
      )}
      {tagSelectMenuOpen && (
        <div className="tag-menu-select-menu">
          <div className="tag-menu-select-menu-header">
            <span
              onClick={() => setTagSelectMenuOpen(false)}
              className="tag-menu-select-menu-header-exit-button"
            >
              x
            </span>
          </div>
          <div className="tag-menu-select-menu-body">
            {tags.map((tag) => (
              <div
                onClick={() => tagUpdated(tag.value, !tag.checked)}
                className="tag-menu-select-menu-item"
                key={tag.value}
              >
                <CheckBox
                  checked={tag.checked}
                  value={tag.value}
                  onChange={(x) => {}}
                />
                {tag.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TagMenu;
