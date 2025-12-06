import { create } from "zustand";

export type EditorSelection =
  | { type: "COMPONENT"; componentId: string }
  | { type: "SLIDE"; componentId: string; id: string }
  | { type: "MARQUEE_ITEM"; componentId: string; itemId: string }
  | { type: "PRODUCT_CAROUSEL_ITEM"; componentId: string; itemId: string }
  | null;

interface EditorStore {
  selection: EditorSelection;
  selectComponent: (componentId: string) => void;
  selectSlide: (componentId: string, id: string) => void;
  selectMarqueeItem: (componentId: string, itemId: string) => void;
  selectProductCarouselItem: (componentId: string, itemId: string) => void;
  clearSelection: () => void;
}

export const useThemeStore = create<EditorStore>((set) => ({
  selection: null,
  selectComponent: (componentId) =>
    set({
      selection: { type: "COMPONENT", componentId },
    }),

  selectSlide: (componentId, id) =>
    set({
      selection: { type: "SLIDE", componentId, id },
    }),

  selectMarqueeItem: (componentId, itemId) =>
    set({
      selection: { type: "MARQUEE_ITEM", componentId, itemId },
    }),

  selectProductCarouselItem: (componentId, itemId) =>
    set({
      selection: { type: "PRODUCT_CAROUSEL_ITEM", componentId, itemId },
    }),

  clearSelection: () => set({ selection: null }),
}));
