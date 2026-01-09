import { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";

export { zodResolver } from "@hookform/resolvers/zod";
export { createId } from "@paralleldrive/cuid2";
export * from "@tanstack/react-query";
export * as dateFns from "date-fns";
export * from "react-hook-form";
export * from "./shared-constants";
export * from "./shared-helpers/shared-helper";
export * from "./shared-helpers/time-helpers";
export type CustomHookQueryTanStackOptions = Omit<
  UseQueryOptions,
  "queryKey" | "queryFn"
>;

export type CustomHookMutationTanStackOptions = Omit<
  UseMutationOptions,
  "mutationKey" | "mutationFn"
>;
