import ActionButton from "../../../components/ActionButton";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type Detail = {
  name: string;
  value: string;
};

type Action = {
  icon: IconProp | string;
  action: () => void;
  title: string;
  key: number;
  disabled?: boolean;
};

type FeatureDetailContainerProps = {
  details: Detail[];
  actions: Action[];
  showActions: boolean;
};

function FeatureDetailContainer({
  details,
  actions,
  showActions,
}: FeatureDetailContainerProps) {
  return (
    <div className="feature-detail-container">
      <div className="feature-details">
        <div className="feature-details-info">
          {details.map((x) => {
            return (
              <p key={x.name}>
                <span>{x.name}</span>: {x.value}
              </p>
            );
          })}
        </div>
        {showActions && (
          <div className="feature-details-actions">
            {actions.map((x) => {
              return (
                <ActionButton
                  key={x.key}
                  action={x.action}
                  icon={x.icon}
                  title={x.title}
                  disabled={x.disabled ?? false}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default FeatureDetailContainer;
