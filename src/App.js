import React from "react";
import "./App.css";
import useRouteNode from "./hooks/useRouteNode";

function App() {
  const { data } = useRouteNode("20116798-dfa6-4311-a99a-a60ed0dd7097");

  return (
    <div>
      <h1>Openftth</h1>
    </div>
  );
}

export default App;
