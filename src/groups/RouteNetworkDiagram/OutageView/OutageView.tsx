import { useEffect, useState } from "react";
import { useClient } from "urql";
import { getInformation, Node } from "./OutageViewGql";
import TreeViewCheckbox, {
  TreeNode,
} from "../../../components/TreeViewCheckbox";

function convertToTreeNodes(node: Node): TreeNode {
  const children: TreeNode[] = [];
  if (node.nodes) {
    node.nodes.forEach((x) => {
      children.push(convertToTreeNodes(x));
    });
  }

  return { ...node, nodes: children, selected: false };
}

function toggleSelectedTreeNodes(
  selected: TreeNode,
  current: TreeNode,
  toggle?: boolean
): TreeNode {
  const newToggle =
    toggle === undefined && selected.id === current.id
      ? !selected.selected
      : toggle;

  const children =
    current.nodes?.map((x) =>
      toggleSelectedTreeNodes(selected, x, newToggle)
    ) ?? [];

  return {
    ...current,
    nodes: children,
    selected: newToggle ?? current.selected,
  };
}

function OutageView() {
  const client = useClient();
  const [node, setNode] = useState<TreeNode | null>(null);

  useEffect(() => {
    const node = getInformation(client);
    setNode(convertToTreeNodes(node));
  }, [client]);

  const onCheckboxClick = (treeNode: TreeNode) => {
    if (node) {
      setNode(toggleSelectedTreeNodes(treeNode, node));
    }
  };

  if (!node) {
    return <></>;
  }

  return (
    <div className="outage-view">
      <TreeViewCheckbox treeNode={node} onCheckboxChange={onCheckboxClick} />
    </div>
  );
}

export default OutageView;
