import Checkbox from "../Checkbox";

export interface TreeNode {
  id: string;
  label: string;
  value: string | null;
  nodes: TreeNode[] | null;
}

function NodeSelectionRow(treeNode: TreeNode) {
  return (
    <div className="node-selection-row">
      <Checkbox checked={false} onChange={() => {}} value={treeNode.id} />
      <p>{treeNode.label}</p>
    </div>
  );
}

function renderNodeTree(node: TreeNode): JSX.Element {
  let childNodes: JSX.Element[] = [];
  if (node.nodes) {
    node.nodes.forEach((x) => {
      childNodes.push(renderNodeTree(x));
    });
  }

  return (
    <div className="node-block">
      {NodeSelectionRow(node)}
      {childNodes.map((x) => {
        return x;
      })}
    </div>
  );
}

interface TreeViewCheckboxProps {
  treeNode: TreeNode;
}

function TreeViewCheckbox({ treeNode }: TreeViewCheckboxProps) {
  return <div className="tree-view-check-box">{renderNodeTree(treeNode)}</div>;
}

export default TreeViewCheckbox;
