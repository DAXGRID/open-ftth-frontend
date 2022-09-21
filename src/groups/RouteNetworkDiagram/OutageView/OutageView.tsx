import { useEffect, useState } from "react";
import { useClient } from "urql";
import { getInformation, Node } from "./OutageViewGql";
import TreeViewCheckbox from "../../../components/TreeViewCheckbox";

function OutageView() {
  const client = useClient();
  const [node, setNode] = useState<Node | null>(null);

  useEffect(() => {
    setNode(getInformation(client));
  }, [client]);

  if (!node) {
    return <></>;
  }

  return (
    <div className="outage-view">
      <TreeViewCheckbox treeNode={node} />
    </div>
  );
}

export default OutageView;
