'use client';

import { createContext, useCallback, useContext, useRef } from 'react';

interface ScrollContextType {
  registerRef: (uniqueId: string, element: HTMLElement | null) => void;
  scrollToComponent: (uniqueId: string) => void;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

interface ScrollProviderProps {
  children: React.ReactNode;
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

export default function ScrollProvider({ children }: ScrollProviderProps) {
  const refsMap = useRef<Map<string, HTMLElement>>(new Map());

  const registerRef = useCallback(
    (uniqueId: string, element: HTMLElement | null) => {
      if (element) {
        refsMap.current.set(uniqueId, element);
      } else {
        refsMap.current.delete(uniqueId);
      }
    },
    [],
  );

  const scrollToComponent = useCallback((uniqueId: string) => {
    const element = refsMap.current.get(uniqueId);
    if (element) {
      if (!isElementInViewport(element)) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, []);

  return (
    <ScrollContext.Provider value={{ registerRef, scrollToComponent }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollContext() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within ScrollProvider');
  }
  return context;
}
