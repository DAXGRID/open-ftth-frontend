import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface MultiOptionActionButtonProps {
  actions: {
    text: string;
    action: () => void;
    disabled: boolean;
    key: string | number;
  }[];
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
        title={title}
        onClick={() => !disabled && setOpen(!open)}
        className={`multi-option-action-button ${disabled ? "disabled" : ""}`}
      >
        {renderIcon(icon, title)}
      </div>
      {open && (
        <div className="multi-option-action-button-menu">
          <ul>
            {actions.map((x) => {
              return (
                <li
                  key={x.key}
                  className={x.disabled ? "disabled" : ""}
                  onClick={() => {
                    if (x.disabled) return;
                    x.action();
                    setOpen(false);
                  }}
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
