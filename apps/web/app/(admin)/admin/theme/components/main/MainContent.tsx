'use client';

import { useDesignStore } from '../../store/design-store';
import ComponentRenderer from './ComponentRenderer';

export default function MainContent() {
  const design = useDesignStore((s) => s.design);
  const activePageId = useDesignStore((s) => s.activePageId);

  const activePage = design?.pages?.find((p) => p.uniqueId === activePageId);

  const pageToShow =
    activePage ||
    (design?.pages && design.pages.length > 0 ? design.pages[0] : null);

  if (!pageToShow) {
    return <ComponentRenderer pageUniqueId="" components={[]} />;
  }

  return (
    <ComponentRenderer
      pageUniqueId={pageToShow.uniqueId}
      components={pageToShow.components}
    />
  );
}
