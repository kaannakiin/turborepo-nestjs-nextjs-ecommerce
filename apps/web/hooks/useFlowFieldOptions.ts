import fetchWrapper, { ApiError } from "@lib/wrappers/fetchWrapper";
import { useQuery } from "@repo/shared";
import { FieldConfig, EnumFieldMeta, RelationFieldMeta } from "@repo/types";

export type SelectOption = {
  label: string;
  value: string;
};

export function useFlowFieldOptions<TData = unknown>(fieldConfig: FieldConfig) {
  const meta = fieldConfig.meta as
    | EnumFieldMeta
    | RelationFieldMeta
    | undefined;

  const staticOptions: SelectOption[] | null =
    meta && "options" in meta && Array.isArray(meta.options)
      ? meta.options
      : null;

  const isRelation = meta && "endpoint" in meta;

  const {
    data: dynamicOptions,
    isLoading,
    error,
  } = useQuery({
    queryKey: isRelation ? [meta.queryKey, meta.endpoint] : ["unknown"],
    enabled: !!isRelation && !staticOptions,
    queryFn: async () => {
      if (!isRelation) return [];
      const response = await fetchWrapper.get(meta.endpoint);
      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error || "Error fetching data");
      }
      return response.data as TData[];
    },
    select: (rawData: TData[]): SelectOption[] => {
      if (!Array.isArray(rawData)) return [];
      const relationMeta = meta as RelationFieldMeta;
      const labelKey = (relationMeta.labelField || "name") as keyof TData;
      const valueKey = (relationMeta.valueField || "id") as keyof TData;

      return rawData.map((item) => {
        const labelVal = item[labelKey];
        const valueVal = item[valueKey];
        return {
          label: labelVal !== undefined ? String(labelVal) : String(item),
          value: valueVal !== undefined ? String(valueVal) : String(item),
        };
      });
    },
  });

  return {
    options: staticOptions || dynamicOptions || [],
    isLoading: staticOptions ? false : isLoading,
    error: staticOptions ? null : error,
  };
}
