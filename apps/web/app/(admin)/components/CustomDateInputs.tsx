"use client";
import { Group, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useEffect, useState } from "react";

interface CustomDateInputsProps {
  onDateChange?: (startDate: Date | null, endDate: Date | null) => void;
  defaultStartDate?: Date | null;
  defaultEndDate?: Date | null;
}

const CustomDateInputs = ({
  onDateChange,
  defaultStartDate = null,
  defaultEndDate = null,
}: CustomDateInputsProps) => {
  const [startDate, setStartDate] = useState<Date | null>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | null>(defaultEndDate);
  const [error, setError] = useState<string | null>(null);

  // URL'den gelen değerler değiştiğinde internal state'i güncelle
  useEffect(() => {
    setStartDate(defaultStartDate);
  }, [defaultStartDate]);

  useEffect(() => {
    setEndDate(defaultEndDate);
  }, [defaultEndDate]);

  const handleStartDateChange = (value: string) => {
    setError(null);

    if (!value) {
      setStartDate(null);
      onDateChange?.(null, endDate);
      return;
    }

    const dateValue = new Date(value);

    if (endDate && dateValue > endDate) {
      setError("Başlangıç tarihi, bitiş tarihinden sonra olamaz");
      return;
    }

    setStartDate(dateValue);
    onDateChange?.(dateValue, endDate);
  };

  const handleEndDateChange = (value: string) => {
    setError(null);

    if (!value) {
      setEndDate(null);
      onDateChange?.(startDate, null);
      return;
    }

    const dateValue = new Date(value);

    if (startDate && dateValue < startDate) {
      setError("Bitiş tarihi, başlangıç tarihinden önce olamaz");
      return;
    }

    setEndDate(dateValue);
    onDateChange?.(startDate, dateValue);
  };

  const getMinEndDate = () => {
    if (!startDate) return undefined;
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  };

  return (
    <div>
      <Group align="center" gap={"md"}>
        <DateInput
          value={startDate}
          onChange={handleStartDateChange}
          placeholder="Başlangıç Tarihi"
          maxDate={endDate || new Date()}
          clearable
          valueFormat="DD/MM/YYYY"
          label="Başlangıç Tarihi"
          error={error && error.includes("Başlangıç")}
        />
        <DateInput
          value={endDate}
          onChange={handleEndDateChange}
          placeholder="Bitiş Tarihi"
          minDate={getMinEndDate()}
          maxDate={new Date()}
          valueFormat="DD/MM/YYYY"
          clearable
          label="Bitiş Tarihi"
          error={error && error.includes("Bitiş")}
        />
      </Group>
      {error && (
        <Text c="red" size="sm" mt="xs">
          {error}
        </Text>
      )}
    </div>
  );
};

export default CustomDateInputs;
