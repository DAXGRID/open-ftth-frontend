import { useEffect, useMemo, useState } from "react";
import { useTranslation, TFunction } from "react-i18next";
import { useQuery, useClient } from "urql";
import {
  MUTATION_UPDATE_NODE_CONTAINER,
  MutationUpdateNodeContainerParams,
  MutationUpdateNodeContainerResponse,
  NodeContainerDetailsResponse,
  NODE_CONTAINER_SPECIFICATIONS_QUERY,
  NodeContainerSpecification,
  Manufacturer,
  QUERY_NODE_CONTAINER_DETAILS,
  NodeContainerSpecificationsResponse,
} from "./EditNodeContainerGql";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import SelectListView, { BodyItem } from "../../../components/SelectListView";
import DefaultButton from "../../../components/DefaultButton";
import { toast } from "react-toastify";

type EditNodeContainerProps = {
  nodeContainerMrid: string;
};

const getFilteredNodeContainerSpecifications = (
  specifications: NodeContainerSpecification[],
  selectedCategory: string | number | undefined
) => {
  const bodyItems = specifications.map<BodyItem>((x) => {
    return {
      rows: [{ id: 0, value: x.name }],
      id: x.id,
    };
  });

  return bodyItems.filter((x) => {
    return (
      specifications.find((y) => {
        return y.id === x.id;
      })?.category === selectedCategory
    );
  });
};

const getFilteredManufacturers = (
  manufacturers: Manufacturer[],
  selectedNodeContainerSpecification: string | number | undefined,
  nodeContainerSpecifications: NodeContainerSpecification[],
  t: TFunction<"translation">
) => {
  if (
    !manufacturers ||
    manufacturers.length === 0 ||
    !selectedNodeContainerSpecification
  ) {
    return [];
  }

  const bodyItems = manufacturers.map<BodyItem>((x) => {
    return {
      rows: [{ id: 0, value: x.name }],
      id: x.id,
    };
  });

  const spanEquipment = nodeContainerSpecifications.find(
    (x) => x.id === selectedNodeContainerSpecification
  );
  if (!spanEquipment) {
    throw new Error(
      `Could not find SpanEquipment on id ${selectedNodeContainerSpecification}`
    );
  }

  const filtered = bodyItems.filter((x) => {
    return spanEquipment.manufacturerRefs.includes(x.id.toString());
  });

  const defaultValue = {
    rows: [{ id: 0, value: t("Unspecified") }],
    id: "",
  };

  return [defaultValue, ...filtered];
};

function EditNodeContainer({ nodeContainerMrid }: EditNodeContainerProps) {
  const { t } = useTranslation();
  const client = useClient();

  const [selectedCategory, setSelectedCategory] = useState<
    string | number | undefined
  >();
  const [specifications, setSpecifications] = useState<
    NodeContainerSpecification[]
  >([]);
  const [selectedSpecification, setSelectedSpecification] = useState<string>();

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");

  const [specificationsQueryResult] =
    useQuery<NodeContainerSpecificationsResponse>({
      query: NODE_CONTAINER_SPECIFICATIONS_QUERY,
    });

  const [nodeContainerDetailsResponse] = useQuery<NodeContainerDetailsResponse>(
    {
      query: QUERY_NODE_CONTAINER_DETAILS,
      variables: { nodeContainerId: nodeContainerMrid },
      pause: !nodeContainerMrid,
    }
  );

  useEffect(() => {
    if (!specificationsQueryResult.data) return;

    const { nodeContainerSpecifications, manufacturers } =
      specificationsQueryResult.data?.utilityNetwork;

    if (!nodeContainerSpecifications || !manufacturers) return;

    setSpecifications(nodeContainerSpecifications);
    setManufacturers(manufacturers);
  }, [specificationsQueryResult]);

  useEffect(() => {
    if (!nodeContainerDetailsResponse.data) return;

    const { specification, manufacturer } =
      nodeContainerDetailsResponse.data?.utilityNetwork.nodeContainer;

    setSelectedCategory(specification.category);
    setSelectedSpecification(specification.id);
    setSelectedManufacturer(manufacturer?.id ?? "");
  }, [nodeContainerDetailsResponse]);

  const filteredNodeContainerSpecifications = useMemo(
    () =>
      getFilteredNodeContainerSpecifications(specifications, selectedCategory),
    [specifications, selectedCategory]
  );

  const selectCategory = (categoryId: string | number | undefined) => {
    if (selectedCategory === categoryId || selectCategory === undefined) return;

    setSelectedCategory(categoryId);
    setSelectedSpecification(undefined);
    setSelectedManufacturer("");
  };

  const categorySelectOptions = () => {
    const categoryOptions = specifications
      .map((x) => {
        return x.category;
      })
      .filter((v, i, a) => a.indexOf(v) === i)
      .map<SelectOption>((x) => {
        return {
          text: t(x),
          value: x,
        };
      });

    // If none is selected - select the first select option
    if (categoryOptions.length > 0 && !selectedCategory) {
      setSelectedCategory(categoryOptions[0].value);
    }

    return categoryOptions;
  };

  const filteredManufactuers = useMemo(
    () =>
      getFilteredManufacturers(
        manufacturers,
        selectedSpecification,
        specifications,
        t
      ),
    [manufacturers, selectedSpecification, specifications, t]
  );

  const selectNodeContainerSpecification = (specificationId: string) => {
    if (selectedSpecification === specificationId) return;

    setSelectedSpecification(specificationId);
    setSelectedManufacturer("");
  };

  const updateNodeContainer = async () => {
    if (!manufacturers || !nodeContainerMrid || !selectedSpecification) {
      toast.error(t("ERROR"));
      return;
    }

    const parameters: MutationUpdateNodeContainerParams = {
      manufacturerId:
        selectedManufacturer === ""
          ? "00000000-0000-0000-0000-000000000000"
          : selectedManufacturer,
      nodeContainerId: nodeContainerMrid,
      specificationId: selectedSpecification,
    };

    const result = await client
      .mutation<MutationUpdateNodeContainerResponse>(
        MUTATION_UPDATE_NODE_CONTAINER,
        parameters
      )
      .toPromise();

    if (!result.data?.nodeContainer.updateProperties.isSuccess) {
      toast.error(
        t(result.data?.nodeContainer.updateProperties.errorCode ?? "ERROR")
      );
    } else {
      toast.success(t("UPDATED"));
    }
  };

  if (
    !nodeContainerMrid ||
    specificationsQueryResult.fetching ||
    nodeContainerDetailsResponse.fetching
  ) {
    return <></>;
  }

  return (
    <div className="edit-node-container page-container">
      <div className="full-row">
        <SelectMenu
          options={categorySelectOptions()}
          removePlaceHolderOnSelect
          onSelected={selectCategory}
          selected={selectedCategory}
        />
      </div>
      <div className="full-row">
        <SelectListView
          headerItems={[t("Specification")]}
          bodyItems={filteredNodeContainerSpecifications}
          selectItem={(x) => selectNodeContainerSpecification(x.id.toString())}
          selected={selectedSpecification}
        />
      </div>
      <div className="full-row">
        <SelectListView
          headerItems={[t("Manufacturer")]}
          bodyItems={filteredManufactuers}
          selectItem={(x) => setSelectedManufacturer(x.id.toString())}
          selected={selectedManufacturer}
        />
      </div>
      <div className="full-row">
        <DefaultButton
          innerText={t("UPDATE")}
          onClick={() => updateNodeContainer()}
          disabled={!selectedSpecification}
        />
      </div>
    </div>
  );
}

export default EditNodeContainer;
