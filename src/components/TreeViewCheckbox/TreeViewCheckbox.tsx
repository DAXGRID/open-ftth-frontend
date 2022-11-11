import Checkbox from "../Checkbox";
import {
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface TreeNode {
  id: string;
  label: string;
  value: string | null;
  nodes: TreeNode[] | null;
  selected: boolean;
  description: string | null;
  expanded: boolean | null;
}

function NodeSelectionRow(
  treeNode: TreeNode,
  onCheckboxClicked: (treeNode: TreeNode) => void,
  onExpandClick: (treeNode: TreeNode) => void
) {
  return (
    <div className="node-selection-row">
      {treeNode.expanded !== null && treeNode.expanded !== undefined && (
        <span className="expand-action" onClick={() => onExpandClick(treeNode)}>
          <FontAwesomeIcon
            icon={treeNode.expanded ? faChevronDown : faChevronRight}
          />
        </span>
      )}
      <Checkbox
        checked={treeNode.selected}
        onChange={() => onCheckboxClicked(treeNode)}
        value={treeNode.id}
        key={treeNode.id}
      />
      <p>{treeNode.label}</p>
      <p>{treeNode.description}</p>
    </div>
  );
}

function renderNodeTree(
  node: TreeNode,
  onCheckboxClicked: (treeNode: TreeNode) => void,
  onExpandClick: (treeNode: TreeNode) => void
): JSX.Element {
  return (
    <div className="node-block" key={node.id}>
      {NodeSelectionRow(node, onCheckboxClicked, onExpandClick)}
      {((node.expanded === null || node.expanded === undefined) || node.expanded) && (
        node.nodes?.map((x) =>
          renderNodeTree(x, onCheckboxClicked, onExpandClick)
        )
      )}
    </div>
  );
}

interface TreeViewCheckboxProps {
  treeNode: TreeNode;
  onCheckboxChange: (treeNode: TreeNode) => void;
  onExpandClick: (treeNode: TreeNode) => void;
  maxHeight?: number;
}

function TreeViewCheckbox({
  treeNode,
  onCheckboxChange,
  onExpandClick,
  maxHeight,
}: TreeViewCheckboxProps) {
  return (
    <div
      style={{ maxHeight: maxHeight ?? "auto" }}
      className="tree-view-check-box"
    >
      {renderNodeTree(treeNode, onCheckboxChange, onExpandClick)}
    </div>
  );
}

export default TreeViewCheckbox;
