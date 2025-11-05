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

  // String'i YYYY-MM-DD formatına çevir
  const formatDateToString = (
    dateValue: string | Date | null
  ): string | null => {
    if (!dateValue) return null;

    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleStartDateChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      const dateString = formatDateToString(value);
      if (dateString) {
        params.set(startKey, dateString);

        if (endDate && new Date(dateString) > new Date(endDate)) {
          params.delete(endKey);
        }
      }
    } else {
      params.delete(startKey);
    }
    params.set("page", "1");
    replace(`?${params.toString()}`);
  };

  const handleEndDateChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      const dateString = formatDateToString(value);
      if (dateString) {
        params.set(endKey, dateString);

        if (startDate && new Date(dateString) < new Date(startDate)) {
          params.delete(startKey);
        }
      }
    } else {
      params.delete(endKey);
    }
    params.set("page", "1");
    replace(`?${params.toString()}`);
  };

  const getMaxDateForStart = () => {
    if (!endDate) return undefined;
    return new Date(endDate);
  };

  const getMinDateForEnd = () => {
    if (!startDate) return undefined;
    return new Date(startDate);
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
        valueFormat="DD/MM/YYYY"
      />
      <DatePickerInput
        placeholder="Bitiş Tarihi"
        clearable
        className="min-w-44"
        leftSection={<IconCalendar />}
        value={endDate ? new Date(endDate) : null}
        onChange={handleEndDateChange}
        minDate={getMinDateForEnd()}
        valueFormat="DD/MM/YYYY"
      />
    </Group>
  );
};

export default CustomDateFilters;
