import loading from "../../assets/loading.svg";

const Loading = () => (
  <div className="loading">
    <div className="spinner">
      <img src={loading} alt="Loading" />
    </div>
  </div>
);

export default Loading;
