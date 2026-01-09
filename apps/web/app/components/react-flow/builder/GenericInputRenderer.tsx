import { useFlowFieldOptions } from "@hooks/useFlowFieldOptions";
import { Skeleton, Stack } from "@mantine/core";
import {
  ConditionOperator,
  EnumFieldMeta,
  FieldConfig,
  LocationFieldMeta,
  RelationFieldMeta,
  resolveInputType,
} from "@repo/types";
import dynamic from "next/dynamic";

const InputSkeleton = () => <Skeleton height={36} radius="md" />;

const FlowNumberInput = dynamic(
  () => import("../flow-inputs/FlowNumberInput"),
  {
    loading: () => <InputSkeleton />,
    ssr: false,
  }
);
const FlowTextInput = dynamic(() => import("../flow-inputs/FlowTextInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});
const FlowSelectInput = dynamic(
  () => import("../flow-inputs/FlowSelectInput"),
  {
    loading: () => <InputSkeleton />,
    ssr: false,
  }
);
const FlowMultiSelectInput = dynamic(
  () => import("../flow-inputs/FlowMultiSelectInput"),
  {
    loading: () => <InputSkeleton />,
    ssr: false,
  }
);
const FlowDateInput = dynamic(() => import("../flow-inputs/FlowDateInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});
const FlowDateRangeInput = dynamic(
  () => import("../flow-inputs/FlowDateRangeInput"),
  {
    loading: () => <InputSkeleton />,
    ssr: false,
  }
);
const FlowRangeInput = dynamic(() => import("../flow-inputs/FlowRangeInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});
const FlowDurationInput = dynamic(
  () => import("../flow-inputs/FlowDurationInput"),
  {
    loading: () => <InputSkeleton />,
    ssr: false,
  }
);
const FlowTimeRangeInput = dynamic(
  () => import("../flow-inputs/FlowTimeRangeInput"),
  {
    loading: () => <InputSkeleton />,
    ssr: false,
  }
);

const CountryInput = dynamic(() => import("@/components/inputs/CountryInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});
const CityInput = dynamic(() => import("@/components/inputs/CityInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});
const StateInput = dynamic(() => import("@/components/inputs/StateInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});
const DistrictInput = dynamic(
  () => import("@/components/inputs/DistrictInput"),
  {
    loading: () => <InputSkeleton />,
    ssr: false,
  }
);

interface GenericInputRendererProps {
  fieldConfig: FieldConfig;
  operator: ConditionOperator;
  value: unknown;
  onChange: (value: unknown) => void;
}

type LocationValue = {
  countryId?: string | null;
  cityId?: string | null;
  stateId?: string | null;
  districtId?: string | null;
};

const isLocationValue = (val: unknown): val is LocationValue => {
  return (
    typeof val === "object" &&
    val !== null &&
    !("min" in val) &&
    !("amount" in val) &&
    !("from" in val)
  );
};

export default function GenericInputRenderer({
  fieldConfig,
  operator,
  value,
  onChange,
}: GenericInputRendererProps) {
  const inputType = resolveInputType(fieldConfig.type, operator);
  const { options, isLoading } = useFlowFieldOptions(fieldConfig);

  if (inputType === "none") {
    return null;
  }

  if (inputType === "duration") {
    const durationVal =
      typeof value === "object" && value && "amount" in value
        ? (value as { amount: number; unit: string })
        : { amount: 30, unit: "DAYS" };

    return (
      <FlowDurationInput value={durationVal} onChange={onChange} label="Süre" />
    );
  }

  if (inputType === "range") {
    const rangeVal =
      typeof value === "object" && value && "min" in value
        ? (value as { min: number; max: number })
        : { min: 0, max: 100 };

    return (
      <FlowRangeInput
        value={rangeVal}
        onChange={onChange}
        label="Değer Aralığı"
      />
    );
  }

  if (inputType === "dateRange") {
    return (
      <FlowDateRangeInput
        value={value as [string | null, string | null]}
        onChange={(val) => {
          if (!val || !val[0] || !val[1]) return;
          onChange({
            from: new Date(val[0]).toISOString(),
            to: new Date(val[1]).toISOString(),
          });
        }}
        label="Tarih Aralığı"
      />
    );
  }

  if (inputType === "timeRange") {
    const timeVal =
      typeof value === "object" && value && "from" in value
        ? (value as { from: string; to: string })
        : { from: "09:00", to: "18:00" };

    return (
      <FlowTimeRangeInput
        value={timeVal}
        onChange={onChange}
        label="Saat Aralığı"
      />
    );
  }

  if (inputType === "number") {
    return (
      <FlowNumberInput
        value={typeof value === "number" ? value : 0}
        onChange={onChange}
        label="Değer"
      />
    );
  }

  if (inputType === "date") {
    return (
      <FlowDateInput
        value={value as string | Date | null}
        onChange={(val) => onChange(val ? new Date(val).toISOString() : null)}
        label="Tarih"
      />
    );
  }

  if (inputType === "select") {
    return (
      <FlowSelectInput
        data={options}
        value={value as string}
        onChange={onChange}
        label={fieldConfig.label}
        disabled={isLoading}
      />
    );
  }
  if (inputType === "multiSelect") {
    // Eski karmaşık if-else (enumMeta/relationMeta) mantığını SİLİYORUZ.
    // Hook bizim için endpoint'e gitti, veriyi çekti ve {label, value} formatına çevirdi.
    return (
      <FlowMultiSelectInput
        data={options}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        label={fieldConfig.label}
        searchable={true} // Relation'lar genelde çok olur, searchable olsun
        disabled={isLoading} // Veri çekilirken input pasif olsun
      />
    );
  }

  if (inputType === "location") {
    const locationMeta = fieldConfig.meta as LocationFieldMeta | undefined;
    const locationType = locationMeta?.locationType ?? "country";
    const locationVal: LocationValue = isLocationValue(value) ? value : {};

    return (
      <LocationInput
        locationType={locationType}
        value={locationVal}
        onChange={onChange}
        dependsOn={locationMeta?.dependsOn}
      />
    );
  }

  if (inputType === "currency") {
    return (
      <FlowSelectInput
        data={options}
        value={value as string}
        onChange={onChange}
        label="Para Birimi"
        disabled={isLoading}
      />
    );
  }

  return (
    <FlowTextInput
      value={typeof value === "string" ? value : ""}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(e.target.value)
      }
      label="Değer"
    />
  );
}

function LocationInput({
  locationType,
  value,
  onChange,
  dependsOn,
}: {
  locationType: "country" | "state" | "city" | "district";
  value: LocationValue;
  onChange: (value: unknown) => void;
  dependsOn?: string[];
}) {
  const handleCountryChange = (data: { value: string } | null) => {
    onChange({
      ...value,
      countryId: data?.value ?? null,
      cityId: null,
      stateId: null,
      districtId: null,
    });
  };

  const handleCityChange = (data: { value: string } | null) => {
    onChange({
      ...value,
      cityId: data?.value ?? null,
      districtId: null,
    });
  };

  const handleStateChange = (data: { value: string } | null) => {
    onChange({
      ...value,
      stateId: data?.value ?? null,
    });
  };

  const handleDistrictChange = (data: { value: string } | null) => {
    onChange({
      ...value,
      districtId: data?.value ?? null,
    });
  };

  switch (locationType) {
    case "country":
      return (
        <CountryInput
          value={value.countryId ?? null}
          onChange={(val) => onChange(val?.value ?? null)}
          selectProps={{ size: "xs", label: "Ülke" }}
        />
      );

    case "city":
      return (
        <Stack gap="xs">
          <CountryInput
            value={value.countryId ?? null}
            onChange={handleCountryChange}
            selectProps={{ size: "xs", label: "Ülke" }}
            onlyCity
          />
          <CityInput
            countryId={value.countryId ?? ""}
            addressType="CITY"
            selectProps={{
              size: "xs",
              label: "Şehir",
              value: value.cityId ?? null,
              disabled: !value.countryId,
            }}
            onSelect={handleCityChange}
          />
        </Stack>
      );

    case "state":
      return (
        <Stack gap="xs">
          <CountryInput
            value={value.countryId ?? null}
            onChange={handleCountryChange}
            selectProps={{ size: "xs", label: "Ülke" }}
            onlyState
          />
          <StateInput
            countryId={value.countryId ?? ""}
            addressType="STATE"
            selectProps={{
              size: "xs",
              label: "Eyalet",
              value: value.stateId ?? null,
              disabled: !value.countryId,
            }}
            onSelect={handleStateChange}
          />
        </Stack>
      );

    case "district":
      return (
        <Stack gap="xs">
          <CountryInput
            value={value.countryId ?? null}
            onChange={handleCountryChange}
            selectProps={{ size: "xs", label: "Ülke" }}
          />
          <CityInput
            countryId={value.countryId ?? ""}
            addressType="CITY"
            selectProps={{
              size: "xs",
              label: "Şehir",
              value: value.cityId ?? null,
              disabled: !value.countryId,
            }}
            onSelect={handleCityChange}
          />
          <DistrictInput
            countryId={value.countryId ?? ""}
            cityId={value.cityId ?? ""}
            addressType="CITY"
            selectProps={{
              size: "xs",
              label: "İlçe",
              value: value.districtId ?? null,
              disabled: !value.cityId,
            }}
            onSelect={handleDistrictChange}
          />
        </Stack>
      );

    default:
      return null;
  }
}
