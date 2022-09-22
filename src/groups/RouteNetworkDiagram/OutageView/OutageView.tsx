import { useEffect, useState, useMemo } from "react";
import { useClient } from "urql";
import { useTranslation } from "react-i18next";
import { getInformation, getWorkTasks, Node, WorkTask } from "./OutageViewGql";
import TreeViewCheckbox, {
  TreeNode,
} from "../../../components/TreeViewCheckbox";
import DefaultButton from "../../../components/DefaultButton";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import { toast } from "react-toastify";

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

function mapWorkTasksToOptions(workTasks: WorkTask[]): SelectOption[] {
  return workTasks.map((x) => ({
    text: `${x.number} - ${x.type}`,
    value: x.number,
    key: x.number,
  }));
}

function selectedNodes(node: TreeNode): TreeNode[] {
  let result: TreeNode[] = [];

  if (node.selected) {
    result.push(node);
  }

  if (node.nodes) {
    node.nodes.forEach((x) => {
      result = [...result, ...selectedNodes(x)];
    });
  }

  return result;
}

function formatNodesClipboard(nodes: TreeNode[]): string {
  return nodes.map((x) => `${x.value}\t${x.description}`).join("\n");
}

function OutageView() {
  const client = useClient();
  const { t } = useTranslation();
  const [node, setNode] = useState<TreeNode | null>(null);
  const [selectedWorkTask, setSelectedWorkTask] = useState<string>("");
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([]);

  useEffect(() => {
    const node = getInformation(client);
    setNode(convertToTreeNodes(node));
  }, [client]);

  useEffect(() => {
    const workTasks = getWorkTasks(client);
    setWorkTasks(workTasks);
  }, [client]);

  const workTaskOptions = useMemo<SelectOption[]>(() => {
    return [
      {
        text: t("SELECT_WORK_TASK"),
        value: "",
        key: "",
      },
      ...mapWorkTasksToOptions(workTasks),
    ];
  }, [workTasks, t]);

  const onCheckboxClick = (treeNode: TreeNode) => {
    if (node) {
      setNode(toggleSelectedTreeNodes(treeNode, node));
    }
  };

  const send = () => {
    if (node) {
      console.log(
        "Selected nodes with values.",
        selectedNodes(node)
          .filter((x) => x.value)
          .map((x) => x.value)
      );
    }
  };

  const copyToClipboard = () => {
    if (node) {
      var clipboardText = formatNodesClipboard(
        selectedNodes(node).filter((x) => x.value)
      );
      navigator.clipboard.writeText(clipboardText).then(
        () => {
          toast.success(t("COPIED_TO_CLIPBOARD"));
        },
        (err) => {
          toast.error(t("COULD_NOT_COPY_TO_CLIPBOARD"));
          console.error(err);
        }
      );
    } else {
      throw Error("Something is wrong, no node is found.");
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
          onSelected={(x) => setSelectedWorkTask(x as string)}
          removePlaceHolderOnSelect
          selected={selectedWorkTask}
          options={workTaskOptions}
        />
      </div>
      <div className="full-row gap-default">
        <DefaultButton
          disabled={selectedWorkTask === ""}
          onClick={() => send()}
          innerText={t("SEND")}
        />
        <DefaultButton
          onClick={() => copyToClipboard()}
          innerText={t("COPY_TO_CLIPBOARD")}
        />
      </div>
    </div>
  );
}

export default OutageView;
