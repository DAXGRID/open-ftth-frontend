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
    { text: t("Pick color marking"), value: -1 },
    { text: "Red", value: "Red" },
    { text: "Blue", value: "Blue" },
    { text: "Yellow", value: "Yellow" },
  ]);
  const [selectedColorMarking, setSelectedColorMarking] = useState<
    string | number | undefined
  >(-1);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    string | number | undefined
  >();
  const [spanEquipmentsBodyItems, setSpanEquipmentsBodyItems] = useState<
    BodyItem[]
  >([]);

  const [
    spanEquipments,
    setSpanEquipmentssetSpanEquipmentSpecifications,
  ] = useState<SpanEquipmentSpecification[]>([]);
  const [
    selectedSpanEquipmentSpecitifcation,
    setSelectedSpanEquipmentSpecification,
  ] = useState<string>();

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
  }, []);

  useEffect(() => {
    if (!retrievedSelectedRouteSegments) return;

    const parameters: PlaceSpanEquipmentParameters = {
      spanEquipmentId: uuidv4(),
      spanEquipmentSpecificationId: selectedSpanEquipmentSpecitifcation as string,
      routeSegmentIds: retrievedSelectedRouteSegments,
      markingColor: selectedColorMarking
        ? (selectedColorMarking as string)
        : undefined,
    };

    const fetchData = async () => {
      const result = await placeSpanEquipmentMutation(parameters);
      setRetrievedSelectedRouteSegments(undefined);
    };

    fetchData();
  }, [
    retrievedSelectedRouteSegments,
    selectedSpanEquipmentSpecitifcation,
    placeSpanEquipmentMutation,
    selectedColorMarking,
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
    setSpanEquipmentssetSpanEquipmentSpecifications(
      spanEquipmentSpecifications
    );
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
      .map<SelectOption>((x) => {
        return {
          text: t(x),
          value: x,
        };
      });

    setCategoryOptions(categoryOptions);
    if (categoryOptions.length > 0) {
      setSelectedCategory(categoryOptions[0].value);
    }
  }, [spanEquipments, t]);

  useEffect(() => {
    setSelectedSpanEquipmentSpecification(undefined);
    setSelectedManufacturer(undefined);
  }, [selectedCategory]);

  const filteredSpanEquipmentSpecifications = () => {
    return spanEquipmentsBodyItems.filter((x) => {
      return (
        spanEquipments.find((y) => {
          return y.id === x.id;
        })?.category === selectedCategory
      );
    });
  };

  const selectSpanEquipmentSpecification = (specificationId: string) => {
    setSelectedSpanEquipmentSpecification(specificationId);
    setSelectedManufacturer(undefined);
  };

  const filteredManufacturers = () => {
    if (!selectedSpanEquipmentSpecitifcation) return [];

    const spanEquipment = spanEquipments.find(
      (x) => x.id === selectedSpanEquipmentSpecitifcation
    );
    if (!spanEquipment) {
      throw new Error(
        `Could not find SpanEquipment on id ${selectedSpanEquipmentSpecitifcation}`
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
          onSelected={setSelectedCategory}
          selected={selectedCategory}
        />
      </div>
      <div className="full-row">
        <SelectListView
          headerItems={[t("Specification")]}
          bodyItems={filteredSpanEquipmentSpecifications()}
          selectItem={(x) => selectSpanEquipmentSpecification(x.id.toString())}
          selected={selectedSpanEquipmentSpecitifcation}
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
          selected={selectedColorMarking}
        />
        <DefaultButton
          innerText={t("Place span equipment")}
          onClick={() => retrieveSelectedSpanEquipments()}
          disabled={
            selectedColorMarking === -1 ||
            !selectedManufacturer ||
            !selectedSpanEquipmentSpecitifcation
              ? true
              : false
          }
        />
      </div>
    </div>
  );
}

export default PlaceTubesPage;
