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
      componentId: string;
      sliderId: string;
      slideId: string;
    }
  | {
      type: "MARQUEE_ITEM";
      componentId: string;
      itemId: string;
    }
  | {
      type: "PRODUCT_CAROUSEL_ITEM";
      componentId: string;
      itemId: string;
    }
  | null;

export type SidebarView =
  | "SECTIONS_LIST"
  | "ADD_LIBRARY"
  | "THEME_SETTINGS"
  | "HEADER"
  | "FOOTER";

interface EditorState {
  activePage: ThemePages;
  setActivePage: (page: ThemePages) => void;
  sidebarView: SidebarView;
  setSidebarView: (view: SidebarView) => void;
  selection: EditorSelection;
  selectComponent: (componentId: string, activePage: ThemePages) => void;
  selectSlide: (componentId: string, sliderId: string, slideId: string) => void;
  selectMarqueeItem: (componentId: string, itemId: string) => void;
  selectProductCarouselItem: (componentId: string, itemId: string) => void;
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

    selectSlide: (componentId, sliderId, slideId) =>
      set({
        selection: {
          type: "SLIDE",
          componentId,
          sliderId,
          slideId,
        },
      }),

    selectMarqueeItem: (componentId, itemId) =>
      set({
        selection: {
          type: "MARQUEE_ITEM",
          componentId,
          itemId,
        },
      }),

    selectProductCarouselItem: (componentId, itemId) =>
      set({
        selection: {
          type: "PRODUCT_CAROUSEL_ITEM",
          componentId,
          itemId,
        },
      }),

    selectHeader: () => set({ selection: { type: "HEADER" } }),
    selectFooter: () => set({ selection: { type: "FOOTER" } }),
    selectPageSettings: () => set({ selection: { type: "PAGE_SETTINGS" } }),
    clearSelection: () => set({ selection: null }),
  }))
);
