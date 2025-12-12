"use client";
import { ThemeInputType } from "@repo/types";
import { Control, useWatch } from "@repo/shared";
import { useThemeStore } from "../../store/theme-store";

export const useActiveComponentData = (control: Control<ThemeInputType>) => {
  const { selection, activePage } = useThemeStore();

  const allPages = useWatch({ control, name: "pages" });

  if (!allPages || !selection) {
    return {
      isValid: false,
      selection: null,
      component: null,
      pageIndex: -1,
      componentIndex: -1,
    };
  }

  const pageIndex = allPages.findIndex((p) => p.pageType === activePage);

  if (pageIndex === -1) {
    return {
      isValid: false,
      selection: null,
      component: null,
      pageIndex: -1,
      componentIndex: -1,
    };
  }

  let componentIndex = -1;

  if (
    selection.type === "COMPONENT" ||
    selection.type === "SLIDE" ||
    selection.type === "MARQUEE_ITEM" ||
    selection.type === "PRODUCT_CAROUSEL_ITEM"
  ) {
    if (typeof selection.componentIndex === "number") {
      componentIndex = selection.componentIndex;
    } else {
      componentIndex = allPages[pageIndex].components.findIndex(
        (c) => c.componentId === selection.componentId
      );
    }
  }

  const component = allPages[pageIndex].components[componentIndex];

  if (componentIndex === -1 || !component) {
    return {
      isValid: false,
      selection,
      component: null,
      pageIndex: -1,
      componentIndex: -1,
    };
  }

  return {
    isValid: true,
    selection,
    component,
    pageIndex,
    componentIndex,
  };
};
