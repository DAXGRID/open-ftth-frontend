import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface MultiOptionActionButtonProps {
  actions: { text: string; action: () => void; disabled: boolean }[];
  title: string;
  icon: IconProp | string;
  disabled: boolean;
}

function renderIcon(icon: IconProp | string, altText: string) {
  if (typeof icon === "string") {
    return <img src={icon as string} alt={altText} />;
  } else {
    return <FontAwesomeIcon icon={icon as IconProp} />;
  }
}

function MultiOptionActionButton({
  actions,
  title,
  icon,
  disabled,
}: MultiOptionActionButtonProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled, setOpen]);

  return (
    <div className="multi-option-action-button-container">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && setOpen(!open)}
        className={
          disabled
            ? "multi-option-action-button disabled"
            : "multi-option-action-button"
        }
      >
        {renderIcon(icon, title)}
      </div>
      {open && (
        <div className="multi-option-action-button-menu">
          <ul>
            {actions.map((x) => {
              return (
                <li
                  className={x.disabled ? "disabled" : ""}
                  onClick={() => x.disabled && x.action()}
                >
                  {x.text}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MultiOptionActionButton;
