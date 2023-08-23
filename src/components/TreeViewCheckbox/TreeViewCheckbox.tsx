import Checkbox from "../Checkbox";
import {
  faChevronDown,
  faChevronRight,
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
  const hasChildNodes =
    treeNode.nodes !== null &&
    treeNode.nodes !== undefined &&
    treeNode.nodes.length > 0;

  const expandable =
    treeNode.expanded !== null && treeNode.expanded !== undefined;

  return (
    <div className="node-selection-row">
      {expandable && (
        <span
          className={`expand-action ${hasChildNodes ? "" : "expand-action--disabled"
            } `}
          onClick={() => hasChildNodes && onExpandClick(treeNode)}
        >
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
) {
  const expandable = node.expanded !== null || node.expanded !== undefined;

  const notExpanded =
    node.expanded === null || node.expanded === undefined || node.expanded;

  return (
    <div
      className={`node-block ${expandable ? "" : "node-block-not-expandable"}`}
      key={node.id}
    >
      {NodeSelectionRow(node, onCheckboxClicked, onExpandClick)}
      {notExpanded &&
        node.nodes?.map((x) =>
          renderNodeTree(x, onCheckboxClicked, onExpandClick)
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
