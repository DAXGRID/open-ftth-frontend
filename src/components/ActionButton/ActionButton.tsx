import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type ActionButtonProps = {
  icon: IconProp | string;
  action: () => void;
};

function ActionButton({ action, icon }: ActionButtonProps) {
  function renderIcon(icon: IconProp | string) {
    if (typeof icon === "string") {
      return <img src={icon as string} />;
    } else {
      return <FontAwesomeIcon icon={icon as IconProp} />;
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => action()}
      onKeyDown={() => action()}
      className="action-button"
    >
      {renderIcon(icon)}
    </div>
  );
}

export default ActionButton;
