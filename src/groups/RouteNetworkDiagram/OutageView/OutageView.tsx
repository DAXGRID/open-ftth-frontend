import { useEffect, useState } from "react";
import { useClient } from "urql";
import { useTranslation } from "react-i18next";
import { getInformation, Node } from "./OutageViewGql";
import TreeViewCheckbox, {
  TreeNode,
} from "../../../components/TreeViewCheckbox";
import DefaultButton from "../../../components/DefaultButton";
import SelectMenu from "../../../components/SelectMenu";

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
  const { t } = useTranslation();
  const [node, setNode] = useState<TreeNode | null>(null);
  const [selectedWorkTask, setSelctedWorkTask] = useState<string>("");

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
      <div className="full-row">
        <TreeViewCheckbox
          maxHeight={500}
          treeNode={node}
          onCheckboxChange={onCheckboxClick}
        />
      </div>
      <div className="full-row">
        <SelectMenu
          onSelected={(x) => setSelctedWorkTask(x as string)}
          removePlaceHolderOnSelect
          selected={selectedWorkTask}
          options={[{ text: t("SELECT_WORK_TASK"), value: "", key: "" }]}
        />
      </div>
      <div className="full-row">
        <DefaultButton onClick={() => {}} innerText={t("SEND")} />
      </div>
    </div>
  );
}

export default OutageView;
