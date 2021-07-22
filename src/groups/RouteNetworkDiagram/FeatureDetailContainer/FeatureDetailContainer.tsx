import Action from "../../../components/ActionButton";

type Detail = {
  name: string;
  value: string;
};

type FeatureDetailContainerProps = {
  details: Detail[];
};

function FeatureDetailContainer({ details }: FeatureDetailContainerProps) {
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
        <div className="feature-details-actions"></div>
      </div>
    </div>
  );
}

export default FeatureDetailContainer;
