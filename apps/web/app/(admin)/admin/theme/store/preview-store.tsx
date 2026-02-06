import { create } from 'zustand';

interface PreviewStore {
  isPreviewMode: boolean;
  togglePreview: () => void;
  setPreviewMode: (value: boolean) => void;
}

export const usePreviewStore = create<PreviewStore>((set) => ({
  isPreviewMode: false,
  togglePreview: () =>
    set((state) => ({ isPreviewMode: !state.isPreviewMode })),
  setPreviewMode: (value: boolean) => set({ isPreviewMode: value }),
}));
