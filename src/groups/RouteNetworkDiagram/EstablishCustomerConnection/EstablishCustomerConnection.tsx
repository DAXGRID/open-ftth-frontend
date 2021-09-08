import { useTranslation, TFunction } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import { useState, useMemo, useEffect, useContext } from "react";
import { useQuery, useClient } from "urql";
import { MapContext } from "../../../contexts/MapContext";
import DefaultButton from "../../../components/DefaultButton";
import TextBox from "../../../components/TextBox";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import { toast } from "react-toastify";
import {
  NEAREST_ACCESS_ADDRESSES_QUERY,
  UnitAddress,
  NearestAccessAddress,
  NearestAccessAddressesResponse,
  NEAREST_NEIGHBOR_NODES_QUERY,
  NearestNeighborNodesResponse,
  NeighborNode,
  SPAN_EQUIPMENT_SPEFICIATIONS_QUERY,
  SpanEquipmentSpecificationsResponse,
  SpanEquipmentSpecification,
  PlaceSpanEquipmentInRouteNetworkParameters,
  PLACE_SPAN_EQUIPMENT_IN_ROUTE_NETWORK_MUTATION,
  PlaceSpanEquipmentResponse,
} from "./EstablishCustomerConnectionGql";

function connectionTypeOptions(t: TFunction<"translation">): SelectOption[] {
  return [{ text: t("CUSTOMER_CONDUIT_END"), value: "CONNECTION_END", key: 0 }];
}

function spanEquipmentSpecificationToOption(
  spanEquipmentSpecification: SpanEquipmentSpecification
): SelectOption {
  return {
    text: spanEquipmentSpecification.name,
    value: spanEquipmentSpecification.id,
    key: spanEquipmentSpecification.id,
  };
}

function nearestNeighborNodeToOption(
  neighborNode: NeighborNode,
  t: TFunction<"translation">
): SelectOption {
  return {
    text: `${
      neighborNode.name ?? t("NO_NAME")
    } - (${neighborNode.distance.toFixed(2)} ${t("METER")})`,
    value: neighborNode.id,
    key: neighborNode.id,
  };
}

function accessAddressToOption(
  nearestAccessAddress: NearestAccessAddress,
  t: TFunction<"translation">
): SelectOption {
  return {
    text: `${nearestAccessAddress.accessAddress.roadName} ${
      nearestAccessAddress.accessAddress.houseNumber
    } - (${nearestAccessAddress.distance.toFixed(2)} ${t("METER")})`,
    value: nearestAccessAddress.accessAddress.id,
    key: nearestAccessAddress.accessAddress.id,
  };
}

function unitAddressToOption(unitAddress: UnitAddress): SelectOption {
  return {
    text: `${unitAddress.floorName ?? ""} ${unitAddress.suitName ?? ""}`,
    value: unitAddress.id,
    key: unitAddress.id,
  };
}

type EstablishCustomerConnectionParams = {
  routeNodeId: string;
  load: boolean;
};

function EstablishCustomerConnection({
  routeNodeId,
  load,
}: EstablishCustomerConnectionParams) {
  const { t } = useTranslation();
  const client = useClient();
  const { setTrace } = useContext(MapContext);
  const [selectedConnectionType, setSelectedConnectionType] =
    useState("CONNECTION_END");
  const [selectedConnectionPoint, setSelectedConnectionPoint] = useState("");
  const [selectedAccessAddress, setSelectedAccessAddress] = useState("");
  const [selectedUnitAddress, setSelectedUnitAddress] = useState("");
  const [selectedSpecification, setSelectedSpecification] = useState("");
  const [additionalAddressInformation, setAdditionAddressInformation] =
    useState("");

  const [nearestAccessAddressesResponse] =
    useQuery<NearestAccessAddressesResponse>({
      query: NEAREST_ACCESS_ADDRESSES_QUERY,
      variables: {
        routeNodeId: routeNodeId,
      },
      pause: !routeNodeId || !load,
    });

  const [nearestNeighborNodesResponse] = useQuery<NearestNeighborNodesResponse>(
    {
      query: NEAREST_NEIGHBOR_NODES_QUERY,
      variables: {
        sourceRouteNodeId: routeNodeId,
      },
      pause: !routeNodeId || !load,
    }
  );

  const [spanEquipmentSpecificationsResponse] =
    useQuery<SpanEquipmentSpecificationsResponse>({
      query: SPAN_EQUIPMENT_SPEFICIATIONS_QUERY,
      pause: !load,
    });

  const accessAddresses = useMemo<SelectOption[]>(() => {
    if (
      !nearestAccessAddressesResponse.data?.addressService
        .nearestAccessAddresses
    )
      return [];

    const defaultList: SelectOption[] = [
      {
        text: t("SELECT_ACCESS_ADDRESS"),
        value: "",
        key: "SELECT_ACCESS_ADDRESS",
      },
    ];

    const options =
      nearestAccessAddressesResponse.data?.addressService.nearestAccessAddresses
        .sort((x, y) => x.distance - y.distance)
        .map((x) => accessAddressToOption(x, t));

    // We do this because there is an issue
    // where unit address has an id but no labels and its the only one
    if (options.length === 1) {
      return [
        {
          text: t("SELECT_ACCESS_ADDRESS"),
          value: options[0].value,
          key: "SELECT_ACCESS_ADDRESS",
        },
      ];
    }

    return defaultList.concat(options);
  }, [nearestAccessAddressesResponse, t]);

  const unitAddressOptions = useMemo<SelectOption[]>(() => {
    if (
      !nearestAccessAddressesResponse.data?.addressService
        .nearestAccessAddresses
    )
      return [];

    const defaultList: SelectOption[] = [
      {
        text: t("SELECT_UNIT_ADDRESS"),
        value: "",
        key: "SELECT_UNIT_ADDRESS",
      },
    ];

    const options =
      nearestAccessAddressesResponse.data?.addressService.nearestAccessAddresses
        .find((x) => x.accessAddress.id === selectedAccessAddress)
        ?.accessAddress.unitAddresses.sort((x, y) =>
          x.externalId > y.externalId ? 1 : -1
        )
        .map(unitAddressToOption) ?? [];

    return defaultList.concat(options);
  }, [nearestAccessAddressesResponse, selectedAccessAddress, t]);

  useEffect(() => {
    if (unitAddressOptions.length === 1)
      setSelectedUnitAddress(unitAddressOptions[0].value.toString());
    else setSelectedUnitAddress("");
  }, [selectedAccessAddress, setSelectedUnitAddress, unitAddressOptions]);

  useEffect(() => {
    if (
      !selectedConnectionPoint ||
      !nearestNeighborNodesResponse.data?.routeNetwork.nearestNeighborNodes
    )
      return;

    const connectionPoint =
      nearestNeighborNodesResponse.data?.routeNetwork.nearestNeighborNodes.find(
        (x) => x.id === selectedConnectionPoint
      );
    if (connectionPoint) {
      setTrace({
        geometries: connectionPoint.routeNetworkSegmentGeometries ?? [],
        ids: connectionPoint.routeNetworkSegmentIds ?? [],
      });
    } else {
      setTrace({ geometries: [], ids: [] });
    }
  }, [selectedConnectionPoint, setTrace, nearestNeighborNodesResponse]);

  const connectionPointOptions = useMemo<SelectOption[]>(() => {
    if (!nearestNeighborNodesResponse.data?.routeNetwork.nearestNeighborNodes)
      return [];

    return nearestNeighborNodesResponse.data.routeNetwork.nearestNeighborNodes
      .sort((x, y) => (x.distance > y.distance ? 1 : -1))
      .map((x) => nearestNeighborNodeToOption(x, t));
  }, [nearestNeighborNodesResponse, t]);

  const specificationOptions = useMemo<SelectOption[]>(() => {
    if (
      !spanEquipmentSpecificationsResponse.data?.utilityNetwork
        .spanEquipmentSpecifications
    )
      return [];

    return spanEquipmentSpecificationsResponse.data.utilityNetwork.spanEquipmentSpecifications
      .filter((x) => x.category === "CustomerConduit")
      .map(spanEquipmentSpecificationToOption);
  }, [spanEquipmentSpecificationsResponse]);

  const handleSelectedConnecionPointChange = (id: string) => {
    setSelectedConnectionPoint(id);
  };

  const perform = async () => {
    const segmentIds =
      nearestNeighborNodesResponse.data?.routeNetwork.nearestNeighborNodes.find(
        (x) => x.id === selectedConnectionPoint
      )?.routeNetworkSegmentIds;

    if (!segmentIds) throw new Error("Error no segment ids could be found.");

    const params: PlaceSpanEquipmentInRouteNetworkParameters = {
      accessAddressId: selectedAccessAddress ? selectedAccessAddress : null,
      unitAddressId: selectedUnitAddress ? selectedUnitAddress : null,
      spanEquipmentId: uuidv4(),
      spanEquipmentSpecificationId: selectedSpecification,
      routeSegmentIds: segmentIds,
      remark: additionalAddressInformation
        ? additionalAddressInformation
        : null,
    };

    const response = await client
      .mutation<PlaceSpanEquipmentResponse>(
        PLACE_SPAN_EQUIPMENT_IN_ROUTE_NETWORK_MUTATION,
        params
      )
      .toPromise();

    if (
      response.data?.spanEquipment.placeSpanEquipmentInRouteNetwork.isSuccess
    ) {
      toast.success(t("Span equipment placed"));
    } else {
      toast.error(
        response.data?.spanEquipment.placeSpanEquipmentInRouteNetwork
          .errorMesssage
      );
    }
  };

  if (
    !load ||
    !routeNodeId ||
    nearestAccessAddressesResponse.fetching ||
    nearestNeighborNodesResponse.fetching ||
    spanEquipmentSpecificationsResponse.fetching
  )
    return <></>;

  if (!selectedConnectionPoint && connectionPointOptions.length > 0) {
    setSelectedConnectionPoint(connectionPointOptions[0].value.toString());
  }

  if (!selectedSpecification && specificationOptions.length > 0) {
    setSelectedSpecification(specificationOptions[0].value.toString());
  }

  return (
    <div className="establish-customer-connection page-container">
      <div className="full-row">
        <SelectMenu
          options={connectionTypeOptions(t)}
          onSelected={(x) => setSelectedConnectionType(x?.toString() ?? "")}
          selected={selectedConnectionType}
        />
      </div>
      <div className="full-row">
        <SelectMenu
          options={connectionPointOptions}
          onSelected={(x) =>
            handleSelectedConnecionPointChange(x?.toString() ?? "")
          }
          selected={selectedConnectionPoint}
        />
      </div>
      <div className="full-row">
        <SelectMenu
          options={specificationOptions}
          onSelected={(x) => setSelectedSpecification(x?.toString() ?? "")}
          selected={selectedSpecification}
        />
      </div>
      <div className="full-row">
        <SelectMenu
          options={accessAddresses ?? []}
          onSelected={(x) => setSelectedAccessAddress(x?.toString() ?? "")}
          selected={selectedAccessAddress}
        />
      </div>
      <div className="full-row">
        <SelectMenu
          options={unitAddressOptions ?? []}
          onSelected={(x) => setSelectedUnitAddress(x?.toString() ?? "")}
          selected={selectedUnitAddress}
        />
      </div>
      <div className="full-row">
        <TextBox
          placeHolder={t("ADDITIONAL_ADDRESS_INFORMATION")}
          setValue={setAdditionAddressInformation}
          value={additionalAddressInformation}
        />
      </div>
      <div className="full-row">
        <DefaultButton innerText={t("PERFORM")} onClick={() => perform()} />
      </div>
    </div>
  );
}

export default EstablishCustomerConnection;
