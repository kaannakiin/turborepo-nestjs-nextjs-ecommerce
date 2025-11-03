"use client";

import { Group } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";

interface CustomDateFiltersProps {
  startKey?: string;
  endKey?: string;
}

const CustomDateFilters = ({
  endKey = "endDate",
  startKey = "startDate",
}: CustomDateFiltersProps) => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  const startDate = searchParams.get(startKey) || null;
  const endDate = searchParams.get(endKey) || null;

  const handleStartDateChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(startKey, value);

      if (endDate && new Date(value) > new Date(endDate)) {
        params.delete(endKey);
      }
    } else {
      params.delete(startKey);
    }

    params.set("page", "1");
    replace(`?${params.toString()}`);
  };

  const handleEndDateChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(endKey, value);
      if (startDate && new Date(value) < new Date(startDate)) {
        params.delete(startKey);
      }
    } else {
      params.delete(endKey);
    }
    params.set("page", "1");
    replace(`?${params.toString()}`);
  };

  const getMaxDateForStart = () => {
    if (!endDate) return undefined;
    const date = new Date(endDate);
    date.setDate(date.getDate() - 1);
    return date;
  };

  const getMinDateForEnd = () => {
    if (!startDate) return undefined;
    const date = new Date(startDate);
    date.setDate(date.getDate() + 1);
    return date;
  };

  return (
    <Group gap={"xs"}>
      <DatePickerInput
        placeholder="Başlangıç Tarihi"
        className="min-w-44"
        leftSection={<IconCalendar />}
        clearable
        value={startDate ? new Date(startDate) : null}
        onChange={handleStartDateChange}
        maxDate={getMaxDateForStart()}
      />
      <DatePickerInput
        placeholder="Bitiş Tarihi"
        clearable
        className="min-w-44"
        leftSection={<IconCalendar />}
        value={endDate ? new Date(endDate) : null}
        onChange={handleEndDateChange}
        minDate={getMinDateForEnd()}
      />
    </Group>
  );
};

export default CustomDateFilters;
