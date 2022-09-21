import Checkbox from "../Checkbox";

export interface TreeNode {
  id: string;
  label: string;
  value: string | null;
  nodes: TreeNode[] | null;
  selected: boolean;
}

function NodeSelectionRow(
  treeNode: TreeNode,
  onClick: (treeNode: TreeNode) => void
) {
  return (
    <div className="node-selection-row">
      <Checkbox
        checked={treeNode.selected}
        onChange={() => onClick(treeNode)}
        value={treeNode.id}
        key={treeNode.id}
      />
      <p>{treeNode.label}</p>
    </div>
  );
}

function renderNodeTree(
  node: TreeNode,
  onClick: (treeNode: TreeNode) => void
): JSX.Element {
  return (
    <div className="node-block">
      {NodeSelectionRow(node, onClick)}
      {node.nodes?.map((x) => renderNodeTree(x, onClick))}
    </div>
  );
}

interface TreeViewCheckboxProps {
  treeNode: TreeNode;
  onCheckboxChange: (treeNode: TreeNode) => void;
}

function TreeViewCheckbox({
  treeNode,
  onCheckboxChange,
}: TreeViewCheckboxProps) {
  return (
    <div className="tree-view-check-box">
      {renderNodeTree(treeNode, onCheckboxChange)}
    </div>
  );
}

export default TreeViewCheckbox;
