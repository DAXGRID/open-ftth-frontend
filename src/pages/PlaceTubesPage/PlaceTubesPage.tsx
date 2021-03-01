import { useEffect, useLayoutEffect, useState } from "react";
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
  const [selectedCategory, setSelectedCategory] = useState<
    string | number | undefined
  >();

  const [
    spanEquipments,
    setSpanEquipmentssetSpanEquipmentSpecifications,
  ] = useState<SpanEquipmentSpecification[]>([]);
  const [
    selectedSpanEquipmentSpecitifcation,
    setSelectedSpanEquipmentSpecification,
  ] = useState<string>();

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

  const categorySelectOptions = () => {
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

    // If none is selected - select the first select option
    if (categoryOptions.length > 0 && !selectedCategory) {
      setSelectedCategory(categoryOptions[0].value);
    }

    return categoryOptions;
  };

  const filteredSpanEquipmentSpecifications = () => {
    const bodyItems = spanEquipments.map<BodyItem>((x) => {
      return {
        rows: [{ id: 0, value: x.name }],
        id: x.id,
      };
    });

    return bodyItems.filter((x) => {
      return (
        spanEquipments.find((y) => {
          return y.id === x.id;
        })?.category === selectedCategory
      );
    });
  };

  const selectCategory = (categoryId: string | number | undefined) => {
    if (selectedCategory === categoryId || selectCategory === undefined) return;

    setSelectedCategory(categoryId);
    setSelectedSpanEquipmentSpecification(undefined);
    setSelectedManufacturer(undefined);
  };

  const selectSpanEquipmentSpecification = (specificationId: string) => {
    if (selectedSpanEquipmentSpecitifcation === specificationId) return;

    setSelectedSpanEquipmentSpecification(specificationId);
    setSelectedManufacturer(undefined);
  };

  const filteredManufacturers = () => {
    if (
      !manufacturers ||
      manufacturers.length === 0 ||
      !selectedSpanEquipmentSpecitifcation
    )
      return [];

    const bodyItems = manufacturers.map<BodyItem>((x) => {
      return {
        rows: [{ id: 0, value: x.name }],
        id: x.id,
      };
    });

    const spanEquipment = spanEquipments.find(
      (x) => x.id === selectedSpanEquipmentSpecitifcation
    );
    if (!spanEquipment) {
      throw new Error(
        `Could not find SpanEquipment on id ${selectedSpanEquipmentSpecitifcation}`
      );
    }

    return bodyItems.filter((x) => {
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
          options={categorySelectOptions()}
          removePlaceHolderOnSelect
          onSelected={selectCategory}
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
