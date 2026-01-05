import { getRegistrationSourceLabel } from "@lib/helpers";
import { Skeleton, Stack } from "@mantine/core";
import { RegistrationSource } from "@repo/database/client";
import dynamic from "next/dynamic";
import {
  ConditionOperator,
  CustomerGroupSmartFields,
  TimeUnit,
} from "@repo/types";

const InputSkeleton = () => <Skeleton height={36} radius="md" />;

const FlowSelectInput = dynamic(() => import("./inputs/FlowSelectInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});

const CityInput = dynamic(() => import("@/components/inputs/CityInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});
const CountryInput = dynamic(() => import("@/components/inputs/CountryInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});
const DistrictInput = dynamic(
  () => import("@/components/inputs/DistrictInput"),
  { loading: () => <InputSkeleton />, ssr: false }
);
const StateInput = dynamic(() => import("@/components/inputs/StateInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});
const FlowDateInput = dynamic(() => import("./inputs/FlowDateInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});
const FlowDateRangeInput = dynamic(
  () => import("./inputs/FlowDateRangeInput"),
  { loading: () => <InputSkeleton />, ssr: false }
);
const FlowNumberInput = dynamic(() => import("./inputs/FlowNumberInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});
const FlowRangeInput = dynamic(() => import("./inputs/FlowRangeInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});
const FlowTextInput = dynamic(() => import("./inputs/FlowTextInput"), {
  loading: () => <InputSkeleton />,
  ssr: false,
});
type LocationValue = {
  countryId?: string | null;
  cityId?: string | null;
  stateId?: string | null;
  districtId?: string | null;
};

type RangeValue = { min: number; max: number };

type DurationValue = {
  amount: number;
  unit: string;
};

type DateRangeValue = {
  from: string;
  to: string;
};

export type FlowInputValue =
  | string
  | number
  | LocationValue
  | DurationValue
  | RangeValue
  | DateRangeValue
  | Date
  | [string | null, string | null]
  | null;
type FlowInputWrapperProps = {
  field: CustomerGroupSmartFields;
  operator: ConditionOperator;
  value: FlowInputValue;
  onChange: (value: FlowInputValue) => void;
};

const isLocationValue = (val: FlowInputValue): val is LocationValue => {
  return (
    typeof val === "object" &&
    val !== null &&
    !("min" in val) &&
    !("amount" in val) &&
    !("from" in val)
  );
};

const isDurationValue = (val: FlowInputValue): val is DurationValue => {
  return (
    typeof val === "object" && val !== null && "amount" in val && "unit" in val
  );
};

const FlowInputWrapper = ({
  field,
  operator,
  value,
  onChange,
}: FlowInputWrapperProps) => {
  const safeLocationValue: LocationValue = isLocationValue(value) ? value : {};

  const handleCountryChange = (countryData: { value: string } | null) => {
    onChange({
      ...safeLocationValue,
      countryId: countryData?.value || null,
      cityId: null,
      stateId: null,
      districtId: null,
    });
  };

  const handleCityChange = (cityData: { value: string } | null) => {
    onChange({
      ...safeLocationValue,
      cityId: cityData?.value || null,
      districtId: null,
    });
  };

  const handleStateChange = (stateData: { value: string } | null) => {
    onChange({
      ...safeLocationValue,
      stateId: stateData?.value || null,
    });
  };

  const handleDistrictChange = (districtData: { value: string } | null) => {
    onChange({
      ...safeLocationValue,
      districtId: districtData?.value || null,
    });
  };

  const renderInput = () => {
    if (operator === ConditionOperator.BETWEEN) {
      if (
        field === CustomerGroupSmartFields.CREATED_AT ||
        field === CustomerGroupSmartFields.LAST_ORDER_DATE ||
        field === CustomerGroupSmartFields.FIRST_ORDER_DATE ||
        field === CustomerGroupSmartFields.EMAIL_VERIFIED_AT ||
        field === CustomerGroupSmartFields.PHONE_VERIFIED_AT
      ) {
        return (
          <FlowDateRangeInput
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

      const rangeObj = value as { min: number; max: number } | null;

      return (
        <FlowRangeInput
          value={rangeObj}
          onChange={(val) => onChange(val)}
          label="Değer Aralığı"
          min={0}
          max={1000}
        />
      );
    }

    switch (field) {
      case CustomerGroupSmartFields.COUNTRY:
        return (
          <CountryInput
            value={
              typeof value === "string"
                ? value
                : safeLocationValue.countryId || null
            }
            onChange={(val) => onChange(val?.value || null)}
            selectProps={{
              size: "xs",
              label: "Ülke",
            }}
          />
        );

      case CustomerGroupSmartFields.CITY:
        return (
          <Stack gap="xs">
            <CountryInput
              value={safeLocationValue.countryId || null}
              onChange={handleCountryChange}
              selectProps={{ label: "Ülke" }}
              onlyCity
            />
            <CityInput
              countryId={safeLocationValue.countryId || ""}
              addressType="CITY"
              selectProps={{
                label: "Şehir",
                size: "xs",
                value: safeLocationValue.cityId || null,
                disabled: !safeLocationValue.countryId,
              }}
              onSelect={handleCityChange}
            />
          </Stack>
        );

      case CustomerGroupSmartFields.STATE:
        return (
          <Stack gap="xs">
            <CountryInput
              value={safeLocationValue.countryId || null}
              onChange={handleCountryChange}
              selectProps={{ label: "Ülke" }}
              onlyState
            />
            <StateInput
              countryId={safeLocationValue.countryId || ""}
              addressType="STATE"
              selectProps={{
                label: "Eyalet",
                size: "xs",
                value: safeLocationValue.stateId || null,
                disabled: !safeLocationValue.countryId,
              }}
              onSelect={handleStateChange}
            />
          </Stack>
        );

      case CustomerGroupSmartFields.DISTRICT:
        return (
          <Stack gap="xs">
            <CountryInput
              value={safeLocationValue.countryId || null}
              onChange={handleCountryChange}
              selectProps={{ label: "Ülke" }}
            />
            <CityInput
              countryId={safeLocationValue.countryId || ""}
              addressType="CITY"
              selectProps={{
                label: "Şehir",
                size: "xs",
                value: safeLocationValue.cityId || null,
                disabled: !safeLocationValue.countryId,
              }}
              onSelect={handleCityChange}
            />
            <DistrictInput
              countryId={safeLocationValue.countryId || ""}
              cityId={safeLocationValue.cityId || ""}
              addressType="CITY"
              selectProps={{
                label: "İlçe",
                size: "xs",
                value: safeLocationValue.districtId || null,
                disabled: !safeLocationValue.cityId,
              }}
              onSelect={handleDistrictChange}
            />
          </Stack>
        );

      case CustomerGroupSmartFields.ORDER_COUNT:
      case CustomerGroupSmartFields.TOTAL_SPENT:
      case CustomerGroupSmartFields.AVERAGE_ORDER_VALUE:
      case CustomerGroupSmartFields.PRICE_LIST:
        return (
          <FlowNumberInput
            value={typeof value === "number" ? value : 0}
            onChange={(val) => onChange(val)}
            label="Değer"
            min={0}
          />
        );

      case CustomerGroupSmartFields.LAST_ORDER_DATE:
      case CustomerGroupSmartFields.FIRST_ORDER_DATE:
      case CustomerGroupSmartFields.CREATED_AT:
      case CustomerGroupSmartFields.EMAIL_VERIFIED_AT:
      case CustomerGroupSmartFields.PHONE_VERIFIED_AT:
        if (
          operator === ConditionOperator.WITHIN_LAST ||
          operator === ConditionOperator.WITHIN_NEXT ||
          operator === ConditionOperator.NOT_WITHIN_LAST
        ) {
          const durationVal = isDurationValue(value)
            ? value
            : { amount: 0, unit: TimeUnit.DAYS };

          return (
            <FlowNumberInput
              value={durationVal.amount}
              onChange={(val) => {
                const currentUnit = durationVal.unit;
                onChange({
                  amount: typeof val === "number" ? val : 0,
                  unit: currentUnit,
                });
              }}
              label="Gün/Süre"
            />
          );
        }

        return (
          <FlowDateInput
            value={
              value instanceof Date || typeof value === "string" ? value : null
            }
            onChange={(val) => onChange(new Date(val).toISOString())}
            label="Tarih"
          />
        );
      case CustomerGroupSmartFields.REGISTRATION_SOURCE:
        return (
          <FlowSelectInput
            data={Object.keys(RegistrationSource).map(
              (data: RegistrationSource) => ({
                value: data,
                label: getRegistrationSourceLabel(data),
              })
            )}
            label="Kayıt Kaynağı"
            value={value as RegistrationSource}
            onChange={(val) => onChange(val as RegistrationSource)}
          />
        );
      default:
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
  };

  return <div className="w-full">{renderInput()}</div>;
};

export default FlowInputWrapper;
