import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type ToggleButtonProps = {
  icon: IconProp | string;
  toggled: boolean;
  toggle: (id: string) => void;
  id: string;
  title: string;
};

function renderIcon(icon: IconProp | string, altText: string) {
  if (typeof icon === "string") {
    return <img src={icon as string} alt={altText} />;
  } else {
    return <FontAwesomeIcon icon={icon as IconProp} />;
  }
}

function ToggleButton({ toggled, icon, toggle, id, title }: ToggleButtonProps) {
  return (
    <div
      title={title}
      role="button"
      tabIndex={0}
      onClick={() => toggle(id)}
      className={toggled ? "toggle-button toggled" : "toggle-button"}
    >
      {renderIcon(icon, title)}
    </div>
  );
}

export default ToggleButton;
