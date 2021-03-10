import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type ActionButtonProps = {
  icon: IconProp | string;
  action: () => void;
  title: string;
};

function renderIcon(icon: IconProp | string, altText: string) {
  if (typeof icon === "string") {
    return <img src={icon as string} alt={altText} />;
  } else {
    return <FontAwesomeIcon icon={icon as IconProp} />;
  }
}

function ActionButton({ action, icon, title }: ActionButtonProps) {
  return (
    <div
      title={title}
      role="button"
      tabIndex={0}
      onClick={() => action()}
      onKeyDown={() => action()}
      className="action-button"
    >
      {renderIcon(icon, title)}
    </div>
  );
}

export default ActionButton;
