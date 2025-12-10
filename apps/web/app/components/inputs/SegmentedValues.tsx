"use client";

import { InputError, InputLabel } from "@mantine/core";
import { clsx } from "clsx";
import { useMemo } from "react";

interface SegmentedDataObj {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface SegmentedValuesProps {
  data: (string | SegmentedDataObj)[];
  value?: string | null;
  onChange?: (value: string) => void;
  label?: string;
  error?: React.ReactNode;
  disabled?: boolean;
  name?: string;
}

const SegmentedValues = ({
  data,
  value,
  onChange,
  label,
  error,
  disabled = false,
}: SegmentedValuesProps) => {
  const normalizedData = useMemo(() => {
    return data.map((item) =>
      typeof item === "string"
        ? { value: item, label: item, disabled: false }
        : { disabled: false, ...item }
    );
  }, [data]);

  const activeIndex = normalizedData.findIndex((item) => item.value === value);
  const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  const itemCount = normalizedData.length;

  const sliderStyle = {
    width: `calc((100% - 8px) / ${itemCount})`,
    transform: `translateX(calc(${safeActiveIndex} * 100%))`,
    left: "4px",
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <InputLabel size="sm" fw={500} className="text-gray-900">
          {label}
        </InputLabel>
      )}

      <div
        className={clsx(
          "relative flex items-center w-full bg-gray-100 rounded-lg p-1 h-9 select-none",
          disabled && "opacity-60 pointer-events-none cursor-not-allowed"
        )}
      >
        {activeIndex !== -1 && !disabled && (
          <div
            className="absolute top-1 bottom-1 bg-white rounded shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={sliderStyle}
          />
        )}

        {normalizedData.map((item) => {
          const isActive = item.value === value;

          return (
            <button
              key={item.value}
              type="button"
              disabled={item.disabled || disabled}
              onClick={() => !item.disabled && onChange?.(item.value)}
              className={clsx(
                "relative flex-1 flex items-center justify-center text-sm font-medium transition-colors duration-200 z-10 h-full rounded-md",
                isActive
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {error && (
        <InputError className="text-xs text-red-600 mt-0.5 animate-in fade-in slide-in-from-top-1">
          {error as string}
        </InputError>
      )}
    </div>
  );
};

export default SegmentedValues;
