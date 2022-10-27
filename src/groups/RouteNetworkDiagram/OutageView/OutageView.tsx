import { useEffect, useState, useMemo } from "react";
import { useClient } from "urql";
import { useTranslation } from "react-i18next";
import { getInformation, getWorkTasks, sendTroubleTicket, Node, WorkTask } from "./OutageViewGql";
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

interface OutageViewProps {
  routeElementId: string;
}

function OutageView({ routeElementId }: OutageViewProps) {
  const client = useClient();
  const { t } = useTranslation();
  const [node, setNode] = useState<TreeNode | null>(null);
  const [selectedWorkTask, setSelectedWorkTask] = useState<string>("");
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([]);

  useEffect(() => {
    getInformation(client, routeElementId).then((reponse) => {
      let outageView = reponse.data?.outage.outageView;
      if (outageView) {
        setNode(convertToTreeNodes(outageView));
      } else {
        console.error(outageView);
        throw Error("Missing outage view.");
      }
    });
  }, [client, routeElementId]);

  useEffect(() => {
    getWorkTasks(client).then((response) => {
      let troubleTickets = response.data?.outage.latestTenTroubleTicketsOrderedByDate;
      if (troubleTickets) {
        setWorkTasks(workTasks);
      } else {
        console.error(response);
        throw Error("Missing trouble tickets.");
      }
    });
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

  const hasWorkTasks = useMemo(() => {
    return workTasks.length > 0;
  }, [workTasks]);

  const selectedNodesWithUniqueValues = useMemo(() => {
    if (node) {
      return [...new Set(selectedNodes(node).filter((x) => x.value))];
    } else {
      return []
    }
  }, [node])

  const onCheckboxClick = (treeNode: TreeNode) => {
    if (node) {
      setNode(toggleSelectedTreeNodes(treeNode, node));
    }
  };

  const sendTroubleTicketAction = () => {
    if (node) {
      sendTroubleTicket(client, {
        installationsIds: selectedNodesWithUniqueValues.map(x => x.value) as string[],
        workTaskId: selectedWorkTask
      }).then((response) => {
        const troubleTicketResponse = response.data?.outage.sendTroubleTicket;
        if (troubleTicketResponse?.isSuccess) {
          toast.success(t("SUCCESS"));
        } else {
          const error = troubleTicketResponse?.errorCode;
          toast.error(t(error ?? "ERROR"));
          console.error(response);
        }
      }).catch((response) => {
        toast.error(t("ERROR"));
        console.error(response);
      });
    }
  };

  const copyToClipboard = () => {
    if (node) {
      var clipboardText = formatNodesClipboard(selectedNodesWithUniqueValues);
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
      {hasWorkTasks && (
        <div className="full-row">
          <SelectMenu
            onSelected={(x) => setSelectedWorkTask(x as string)}
            removePlaceHolderOnSelect
            selected={selectedWorkTask}
            options={workTaskOptions}
          />
        </div>
      )}
      <div className="full-row gap-default">
        {hasWorkTasks && (
          <DefaultButton
            disabled={selectedWorkTask === "" || selectedNodesWithUniqueValues.length === 0}
            onClick={() => sendTroubleTicketAction()}
            innerText={t("SEND")}
          />
        )}
        <DefaultButton
          disabled={selectedNodesWithUniqueValues.length === 0}
          onClick={() => copyToClipboard()}
          innerText={t("COPY_TO_CLIPBOARD")}
        />
      </div>
    </div>
  );
}

export default OutageView;
