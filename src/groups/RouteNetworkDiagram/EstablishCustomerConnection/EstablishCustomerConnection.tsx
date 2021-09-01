import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "urql";
import DefaultButton from "../../../components/DefaultButton";
import SelectMenu, { SelectOption } from "../../../components/SelectMenu";
import {
  NEAREST_ACCESS_ADDRESSES_QUERY,
  UnitAddress,
  NearestAccessAddress,
  NearestAccessAddressesResponse,
} from "./EstablishCustomerConnectionGql";

const connectionTypeOptions: SelectOption[] = [
  { text: "CUSTOMER_CONDUIT_END", value: "CONNECTION_END", key: 0 },
];

interface AccessAddressSelectOption extends SelectOption {
  distance: Number;
}

const connectionPointOptions: SelectOption[] = [
  { text: "Skab F3420", value: "1", key: 0 },
  { text: "Skab F3425", value: "2", key: 1 },
  { text: "Skab F3430", value: "3", key: 2 },
  { text: "Skab F3435", value: "4", key: 3 },
  { text: "Skab F3440", value: "5", key: 4 },
];

function accessAddressToOption(
  nearestAccessAddress: NearestAccessAddress
): AccessAddressSelectOption {
  return {
    text: `${nearestAccessAddress.accessAddress.roadName} ${
      nearestAccessAddress.accessAddress.houseNumber
    } - (${nearestAccessAddress.distance.toFixed(2)} meters).`,
    value: nearestAccessAddress.accessAddress.id,
    key: nearestAccessAddress.accessAddress.id,
    distance: nearestAccessAddress.distance,
  };
}

function unitAddressToOption(unitAddress: UnitAddress): SelectOption {
  return {
    text: `${unitAddress.suitName ?? ""} ${unitAddress.floorName ?? ""}`,
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
  const [selectedConnectionType, setSelectedConnectionType] =
    useState("CONNECTION_END");
  const [selectedConnectionPoint, setSelectedConnectionPoint] = useState("1");
  const [selectedAccessAddress, setSelectedAccessAddress] = useState("");
  const [selectedUnitAddress, setSelectedUnitAddress] = useState("");

  const [queryResponse] = useQuery<NearestAccessAddressesResponse>({
    query: NEAREST_ACCESS_ADDRESSES_QUERY,
    variables: {
      routeNodeId: routeNodeId,
    },
    pause: !routeNodeId || !load,
  });

  const accessAddresses = useMemo<SelectOption[]>(() => {
    if (!queryResponse.data?.addressService.nearestAccessAddresses) return [];

    return queryResponse.data?.addressService.nearestAccessAddresses
      .sort((x, y) => {
        return x.distance - y.distance;
      })
      .map(accessAddressToOption);
  }, [queryResponse]);

  const unitAddresses = useMemo<SelectOption[]>(() => {
    if (!queryResponse.data?.addressService.nearestAccessAddresses) return [];

    return (
      queryResponse.data?.addressService.nearestAccessAddresses
        .find((x) => x.accessAddress.id === selectedAccessAddress)
        ?.accessAddress.unitAddresses.map(unitAddressToOption)
        ?.sort((x, y) => {
          return x.text > y.text ? 1 : -1;
        }) ?? []
    );
  }, [queryResponse, selectedAccessAddress]);

  if (!load || !routeNodeId || queryResponse.fetching) return <></>;

  return (
    <div className="establish-customer-connection page-container">
      <div className="full-row">
        <SelectMenu
          options={connectionTypeOptions}
          onSelected={(x) => setSelectedConnectionType(x?.toString() ?? "")}
          selected={selectedConnectionType}
        />
      </div>
      <div className="full-row">
        <SelectMenu
          options={connectionPointOptions}
          onSelected={(x) => setSelectedConnectionPoint(x?.toString() ?? "")}
          selected={selectedConnectionPoint}
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
          options={unitAddresses ?? []}
          onSelected={(x) => setSelectedUnitAddress(x?.toString() ?? "")}
          selected={selectedUnitAddress}
        />
      </div>
      <div className="full-row">
        <DefaultButton innerText={t("PERFORM")} onClick={() => {}} />
      </div>
    </div>
  );
}

export default EstablishCustomerConnection;
