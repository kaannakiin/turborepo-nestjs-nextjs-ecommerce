import { create } from 'zustand';

interface ScrollStore {
  refsMap: Map<string, HTMLElement>;
  registerRef: (uniqueId: string, element: HTMLElement | null) => void;
  scrollToComponent: (uniqueId: string) => void;
}

function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const verticallyVisible = rect.top >= 0 && rect.bottom <= windowHeight;
  const horizontallyVisible = rect.left >= 0 && rect.right <= windowWidth;

  return verticallyVisible && horizontallyVisible;
}

export const useScrollStore = create<ScrollStore>((set, get) => ({
  refsMap: new Map(),

  registerRef: (uniqueId: string, element: HTMLElement | null) => {
    const { refsMap } = get();
    if (element) {
      refsMap.set(uniqueId, element);
    } else {
      refsMap.delete(uniqueId);
    }
    set({ refsMap: new Map(refsMap) });
  },

  scrollToComponent: (uniqueId: string) => {
    const { refsMap } = get();
    const element = refsMap.get(uniqueId);
    if (element && !isElementInViewport(element)) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  },
}));
