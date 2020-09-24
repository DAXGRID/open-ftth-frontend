import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { createClient, Provider } from "urql";
import "./global-styles/reset.css";
import "./global-styles/index.css";

const client = createClient({
  url: "http://10.108.221.139",
});

ReactDOM.render(
  <React.StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
