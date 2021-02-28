import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import PubSub from "pubsub-js";
import SelectListView, { BodyItem } from "../../components/SelectListView";
import SelectMenu, { SelectOption } from "../../components/SelectMenu";
import DefaultButton from "../../components/DefaultButton";
import useBridgeConnector, {
  RetrieveSelectedSpanEquipmentsResponse,
} from "../../bridge/useBridgeConnector";
import Loading from "../../components/Loading";
import { useQuery, useMutation } from "urql";
import {
  UtilityNetworkResponse,
  SPAN_EQUIPMENT_SPEFICIATIONS_MANUFACTURER_QUERY,
  Manufacturer,
  SpanEquipmentSpecification,
  PlaceSpanEquipmentParameters,
  PLACE_SPAN_EQUIPMENT_IN_ROUTE_NETWORK,
  PlaceSpanEquipmentResponse,
} from "./PlaceTubesPageGql";

function PlaceTubesPage() {
  const { t } = useTranslation();
  const { retrieveSelectedSpanEquipments } = useBridgeConnector();
  const [colorMarkingOptions] = useState<SelectOption[]>([
    { text: t("Pick color marking"), value: -1, selected: true },
    { text: "Red", value: "Red", selected: false },
    { text: "Blue", value: "Blue", selected: false },
    { text: "Yellow", value: "Yellow", selected: false },
  ]);
  const [
    selectedColorMarking,
    setSelectedColorMarking,
  ] = useState<SelectOption>();
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption>();
  const [spanEquipmentsBodyItems, setSpanEquipmentsBodyItems] = useState<
    BodyItem[]
  >([]);

  const [spanEquipments, setSpanEquipments] = useState<
    SpanEquipmentSpecification[]
  >([]);
  const [selectedSpanEquipment, setSelectedSpanEquipment] = useState<string>();

  const [manufacturerBodyItems, setManufacturerBodyItems] = useState<
    BodyItem[]
  >([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>();
  const [
    retrievedSelectedRouteSegments,
    setRetrievedSelectedRouteSegments,
  ] = useState<string[]>();

  const [spanEquipmentResult] = useQuery<UtilityNetworkResponse>({
    query: SPAN_EQUIPMENT_SPEFICIATIONS_MANUFACTURER_QUERY,
  });

  const [
    placeSpanEquipmentMutationResult,
    placeSpanEquipmentMutation,
  ] = useMutation<PlaceSpanEquipmentResponse>(
    PLACE_SPAN_EQUIPMENT_IN_ROUTE_NETWORK
  );

  const { fetching } = spanEquipmentResult;

  useEffect(() => {
    const token = PubSub.subscribe(
      "RetrieveSelectedResponse",
      async (_msg: string, data: RetrieveSelectedSpanEquipmentsResponse) => {
        if (data.selectedFeaturesMrid.length === 0) {
          setRetrievedSelectedRouteSegments(undefined);
        } else {
          setRetrievedSelectedRouteSegments(data.selectedFeaturesMrid);
        }
      }
    );

    return () => {
      PubSub.unsubscribe(token);
    };
  }, [t]);

  useEffect(() => {
    if (!retrievedSelectedRouteSegments) return;

    const parameters: PlaceSpanEquipmentParameters = {
      spanEquipmentId: uuidv4(),
      spanEquipmentSpecificationId: selectedSpanEquipment as string,
      routeSegmentIds: retrievedSelectedRouteSegments,
      markingColor: selectedColorMarking?.value
        ? (selectedColorMarking.value as string)
        : undefined,
    };

    const fetchData = async () => {
      const result = await placeSpanEquipmentMutation(parameters);
      setRetrievedSelectedRouteSegments(undefined);
    };

    fetchData();
  }, [
    retrievedSelectedRouteSegments,
    selectedSpanEquipment,
    placeSpanEquipmentMutation,
    selectedColorMarking?.value,
  ]);

  useEffect(() => {
    if (!spanEquipmentResult.data) {
      return;
    }

    const {
      spanEquipmentSpecifications,
      manufacturers,
    } = spanEquipmentResult.data.utilityNetwork;

    if (!spanEquipmentSpecifications || !manufacturers) {
      return;
    }

    setManufacturers(manufacturers);
    setSpanEquipments(spanEquipmentSpecifications);
  }, [spanEquipmentResult]);

  useEffect(() => {
    const bodyItems = manufacturers.map<BodyItem>((x) => {
      return {
        rows: [{ id: 0, value: x.name }],
        id: x.id,
      };
    });

    setManufacturerBodyItems(bodyItems);
  }, [manufacturers]);

  useEffect(() => {
    const seBodyItems = spanEquipments.map<BodyItem>((x) => {
      return {
        rows: [{ id: 0, value: x.name }],
        id: x.id,
      };
    });

    setSpanEquipmentsBodyItems(seBodyItems);

    const categoryOptions = spanEquipments
      .map((x) => {
        return x.category;
      })
      .filter((v, i, a) => a.indexOf(v) === i)
      .map<SelectOption>((x, i) => {
        return {
          text: t(x),
          value: x,
          selected: i === 0 ? true : false,
        };
      });

    setCategoryOptions(categoryOptions);
  }, [spanEquipments, t]);

  useEffect(() => {
    setSelectedSpanEquipment(undefined);
    setSelectedManufacturer(undefined);
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedManufacturer(undefined);
  }, [selectedSpanEquipment]);

  const filteredSpanEquipments = () => {
    return spanEquipmentsBodyItems.filter((x) => {
      return (
        spanEquipments.find((y) => {
          return y.id === x.id;
        })?.category === selectedCategory?.value
      );
    });
  };

  const filteredManufacturers = () => {
    if (!selectedSpanEquipment) return [];

    const spanEquipment = spanEquipments.find(
      (x) => x.id === selectedSpanEquipment
    );
    if (!spanEquipment) {
      throw new Error(
        `Could not find SpanEquipment on id ${selectedSpanEquipment}`
      );
    }

    return manufacturerBodyItems.filter((x) => {
      return spanEquipment.manufacturerRefs.includes(x.id.toString());
    });
  };

  if (fetching) {
    return <Loading />;
  }

  return (
    <div className="page-container">
      <div className="full-row">
        <SelectMenu
          options={categoryOptions}
          removePlaceHolderOnSelect
          onSelected={(x) => setSelectedCategory(x)}
        />
      </div>
      <div className="full-row">
        <SelectListView
          headerItems={[t("Specification")]}
          bodyItems={filteredSpanEquipments()}
          selectItem={(x) => setSelectedSpanEquipment(x.id.toString())}
          selected={selectedSpanEquipment}
        />
      </div>
      <div className="full-row">
        <SelectListView
          headerItems={[t("Manufacturer")]}
          bodyItems={filteredManufacturers()}
          selectItem={(x) => setSelectedManufacturer(x.id.toString())}
          selected={selectedManufacturer}
        />
      </div>
      <div className="full-row">
        <SelectMenu
          options={colorMarkingOptions}
          removePlaceHolderOnSelect
          onSelected={(x) => setSelectedColorMarking(x)}
        />
        <DefaultButton
          innerText={t("Place span equipment")}
          onClick={() => retrieveSelectedSpanEquipments()}
          disabled={
            selectedColorMarking?.value === -1 ||
            !selectedManufacturer ||
            !selectedSpanEquipment
              ? true
              : false
          }
        />
      </div>
    </div>
  );
}

export default PlaceTubesPage;
