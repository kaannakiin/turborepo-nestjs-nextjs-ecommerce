import { ThemeInputType } from "@repo/types";
import { Control, useWatch } from "react-hook-form";
import { useThemeStore } from "../../store/zustand-zod-theme.store";

export const useActiveComponentData = (control: Control<ThemeInputType>) => {
  const { selection } = useThemeStore();
  const allComponents = useWatch({ control, name: "components" });

  if (!allComponents || !selection) {
    return { isValid: false, selection: null, component: null, index: -1 };
  }

  const index = allComponents.findIndex((c) => c.componentId === selection.componentId);
  const component = allComponents[index];

  if (index === -1 || !component) {
    return { isValid: false, selection, component: null, index: -1 };
  }

  return {
    isValid: true,
    selection,
    component,
    index,
  };
};
