import { ThemePages } from "@repo/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type EditorSelection =
  | { type: "PAGE_SETTINGS" }
  | { type: "HEADER" }
  | { type: "FOOTER" }
  | { type: "COMPONENT"; componentId: string; activePage: ThemePages }
  | {
      type: "SLIDE";
      activePage: ThemePages;
      componentId: string;
      sliderId: string;
      slideId: string;
    }
  | {
      type: "MARQUEE_ITEM";
      activePage: ThemePages;
      componentId: string;
      itemId: string;
    }
  | {
      type: "PRODUCT_CAROUSEL_ITEM";
      activePage: ThemePages;
      componentId: string;
      itemId: string;
    }
  | null;

export type SidebarView = "SECTIONS_LIST" | "ADD_LIBRARY";

interface EditorState {
  activePage: ThemePages;
  setActivePage: (page: ThemePages) => void;
  sidebarView: SidebarView;
  setSidebarView: (view: SidebarView) => void;
  selection: EditorSelection;
  selectComponent: (componentId: string, activePage: ThemePages) => void;
  selectSlide: (
    componentId: string,
    sliderId: string,
    slideId: string,
    activePage: ThemePages
  ) => void;
  selectMarqueeItem: (
    componentId: string,
    itemId: string,
    activePage: ThemePages
  ) => void;
  selectProductCarouselItem: (
    componentId: string,
    itemId: string,
    activePage: ThemePages
  ) => void;
  selectHeader: () => void;
  selectFooter: () => void;
  selectPageSettings: () => void;
  clearSelection: () => void;
}

export const useThemeStore = create<EditorState>()(
  devtools((set) => ({
    activePage: "HOMEPAGE",
    sidebarView: "SECTIONS_LIST",
    selection: null,
    setActivePage: (page) =>
      set({ activePage: page, selection: null, sidebarView: "SECTIONS_LIST" }),
    setSidebarView: (view) => set({ sidebarView: view }),

    selectComponent: (componentId, activePage) =>
      set({ selection: { type: "COMPONENT", componentId, activePage } }),

    selectSlide: (componentId, sliderId, slideId, activePage) =>
      set({
        selection: {
          type: "SLIDE",
          componentId,
          sliderId,
          slideId,
          activePage,
        },
      }),

    selectMarqueeItem: (componentId, itemId, activePage) =>
      set({
        selection: {
          type: "MARQUEE_ITEM",
          componentId,
          itemId,
          activePage,
        },
      }),

    selectProductCarouselItem: (componentId, itemId, activePage) =>
      set({
        selection: {
          type: "PRODUCT_CAROUSEL_ITEM",
          componentId,
          itemId,
          activePage,
        },
      }),

    selectHeader: () => set({ selection: { type: "HEADER" } }),
    selectFooter: () => set({ selection: { type: "FOOTER" } }),
    selectPageSettings: () => set({ selection: { type: "PAGE_SETTINGS" } }),
    clearSelection: () => set({ selection: null }),
  }))
);
